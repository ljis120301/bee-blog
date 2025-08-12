// Cloudflare-friendly IP logging API (JSON file storage)
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const LOG_FILE_PATH = path.join(process.cwd(), 'data', 'ip-log.json');

function normalizeIp(raw) {
  if (!raw) return 'unknown';
  let v = String(raw).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  v = v.replace(/^\[/, '').replace(/\]$/, '');
  v = v.replace(/:\d+$/, '');
  if (v.startsWith('::ffff:')) v = v.replace('::ffff:', '');
  return v;
}

function isLocalOrPrivateIp(ip) {
  if (!ip || ip === 'unknown') return true;
  const normalized = ip.trim().toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // IPv6 ULA
  if (normalized.startsWith('fe80:')) return true; // IPv6 link-local
  const v4 = normalized.startsWith('::ffff:') ? normalized.replace('::ffff:', '') : normalized;
  const isLoopback = v4.startsWith('127.') || v4 === '0.0.0.0';
  const is10 = v4.startsWith('10.');
  const is172 = /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(v4);
  const is192 = v4.startsWith('192.168.');
  const isLinkLocal = v4.startsWith('169.254.');
  const isCgnat = /^100\.(6[4-9]|[7-9]\d|1\d{2}|2[01]\d|22[0-3])\./.test(v4);
  return isLoopback || is10 || is172 || is192 || isLinkLocal || isCgnat;
}

function isValidPublicIp(ip) {
  if (!ip || ip === 'unknown') return false;
  const v = ip.trim();
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  const looksLikeIp = ipv4Regex.test(v) || ipv6Regex.test(v);
  if (!looksLikeIp) return false;
  return !isLocalOrPrivateIp(v);
}

function parseForwardedForIp(forwardedHeaderValue) {
  if (!forwardedHeaderValue) return null;
  try {
    const parts = String(forwardedHeaderValue).split(',');
    for (const part of parts) {
      const segs = part.split(';');
      for (const seg of segs) {
        const [k, vRaw] = seg.trim().split('=');
        if (!k || k.toLowerCase() !== 'for' || !vRaw) continue;
        let v = vRaw.trim().replace(/^"|"$/g, '');
        v = v.replace(/^\[/, '').replace(/\]$/, '');
        v = v.replace(/:\d+$/, '');
        if (isValidPublicIp(v)) return normalizeIp(v);
      }
    }
  } catch {}
  return null;
}

function firstPublicFromXff(xffValue) {
  if (!xffValue) return null;
  const candidates = String(xffValue)
    .split(',')
    .map((s) => normalizeIp(s))
    .filter(Boolean);
  for (const ip of candidates) {
    if (isValidPublicIp(ip)) return ip;
  }
  return candidates.find(Boolean) || null;
}

function getClientIp(request) {
  const headers = request.headers;
  const clientProvided = normalizeIp(headers.get('x-client-ip'));
  if (isValidPublicIp(clientProvided)) return clientProvided;

  const cfConnectingIp = headers.get('cf-connecting-ip') || headers.get('CF-Connecting-IP');
  if (isValidPublicIp(cfConnectingIp)) return normalizeIp(cfConnectingIp);

  const trueClientIp = headers.get('true-client-ip') || headers.get('True-Client-IP');
  if (isValidPublicIp(trueClientIp)) return normalizeIp(trueClientIp);

  const forwarded = headers.get('forwarded') || headers.get('Forwarded');
  const fIp = parseForwardedForIp(forwarded);
  if (fIp) return fIp;

  const xff = headers.get('x-forwarded-for') || headers.get('X-Forwarded-For');
  const xffIp = firstPublicFromXff(xff);
  if (xffIp) return xffIp;

  const xRealIp = headers.get('x-real-ip') || headers.get('X-Real-IP');
  if (isValidPublicIp(xRealIp)) return normalizeIp(xRealIp);

  return 'unknown';
}

async function readLogFile() {
  try {
    const content = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

async function appendLogEntry(entry) {
  await fs.mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
  const existing = await readLogFile();
  existing.push(entry);
  await fs.writeFile(LOG_FILE_PATH, JSON.stringify(existing, null, 2));
}

export async function POST(request) {
  try {
    const now = new Date().toISOString();
    const url = new URL(request.url);
    let clientPayload = {};
    try {
      clientPayload = await request.json();
    } catch (_) {}

    const headers = request.headers;
    const ip = getClientIp(request);
    const entry = {
      ip,
      method: request.method,
      path: url.pathname,
      url: url.toString(),
      referrer: headers.get('referer') || headers.get('referrer') || null,
      userAgent: headers.get('user-agent') || null,
      country: headers.get('cf-ipcountry') || null,
      cfRay: headers.get('cf-ray') || null,
      cfVisitor: headers.get('cf-visitor') || null,
      timestamp: now,
      client: typeof clientPayload === 'object' ? clientPayload : null,
    };

    await appendLogEntry(entry);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('IP log error:', error);
    return NextResponse.json({ error: 'Failed to write IP log' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await readLogFile();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('IP log read error:', error);
    return NextResponse.json({ error: 'Failed to read IP log' }, { status: 500 });
  }
}


