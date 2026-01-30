"use client";

import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { IconSettings, IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

// Tag color presets
const TAG_COLOR_PRESETS = [
    { name: 'Peach', bg: '#ef9f76', text: '#303446' },
    { name: 'Yellow', bg: '#e5c890', text: '#303446' },
    { name: 'Green', bg: '#a6d189', text: '#303446' },
    { name: 'Mauve', bg: '#ca9ee6', text: '#303446' },
    { name: 'Blue', bg: '#8caaee', text: '#303446' },
    { name: 'Red', bg: '#e78284', text: '#303446' },
    { name: 'Maroon', bg: '#ea999c', text: '#303446' },
    { name: 'Pink', bg: '#f4b8e4', text: '#303446' },
    { name: 'Sky', bg: '#99d1db', text: '#303446' },
    { name: 'Teal', bg: '#81c8be', text: '#303446' },
    { name: 'Sapphire', bg: '#85c1dc', text: '#303446' },
    { name: 'Lavender', bg: '#babbf1', text: '#303446' },
    { name: 'Rosewater', bg: '#f2d5cf', text: '#303446' },
    { name: 'Flamingo', bg: '#eebebe', text: '#303446' },
    { name: 'Overlay', bg: '#e6e9ef', text: '#303446' },
];

const inputClass =
    "w-full px-3 py-2 text-sm border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 rounded-lg bg-white/80 dark:bg-cat-frappe-surface0/80 text-cat-frappe-base dark:text-cat-frappe-text placeholder:text-cat-frappe-overlay0 focus:outline-none focus:ring-2 focus:ring-cat-frappe-peach/50 focus:border-cat-frappe-peach transition-all";

// Section component for consistent styling
const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="mb-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mb-2 hover:opacity-80 transition-opacity"
            >
                <span>{title}</span>
                {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </button>
            <div
                className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                {children}
            </div>
        </div>
    );
};

// Input field component
const Field = ({ label, hint, children }) => (
    <div className="mb-3">
        <label className="block text-xs font-medium text-cat-frappe-base dark:text-cat-frappe-subtext1 mb-1">
            {label}
        </label>
        {children}
        {hint && (
            <p className="text-[10px] mt-0.5 text-cat-frappe-subtext0 dark:text-cat-frappe-overlay1">
                {hint}
            </p>
        )}
    </div>
);

export default function SettingsPanel({
    // State
    isOpen,
    onToggle,
    // Article info
    title,
    setTitle,
    dek,
    setDek,
    description,
    setDescription,
    slug,
    heroImageUrl,
    onHeroImageUpload,
    // SEO
    seoTitle,
    setSeoTitle,
    seoDescription,
    setSeoDescription,
    seoKeywords,
    setSeoKeywords,
    seoAutoKeywords,
    setSeoAutoKeywords,
    // Display
    isSpanTwo,
    setIsSpanTwo,
    // Tags
    availableTags,
    selectedTagIds,
    addTagToPost,
    removeTagFromPost,
    isEditingTags,
    setIsEditingTags,
    requestDeleteTag,
    newTagName,
    setNewTagName,
    newTagBg,
    setNewTagBg,
    newTagFg,
    setNewTagFg,
    selectedPreset,
    setSelectedPreset,
    handleCreateTag,
    // Layout variant
    variant = "desktop", // "desktop" | "mobile"
}) {
    const isDesktop = variant === "desktop";

    const panelContent = (
        <div className={`${isDesktop ? "p-4" : "p-4"}`}>
            {/* Article Info Section */}
            <Section title="Article Info">
                <Field label="Title" hint="Main headline. Keep it clear and compelling.">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your article title..."
                        className={inputClass}
                    />
                </Field>

                <Field label="Summary" hint="Appears below title and in SEO previews.">
                    <textarea
                        value={dek || description}
                        onChange={(e) => {
                            setDek(e.target.value);
                            setDescription(e.target.value);
                        }}
                        placeholder="Write a compelling summary..."
                        rows={3}
                        className={inputClass}
                    />
                </Field>

                <Field label="Slug" hint="Auto-generated from title.">
                    <input
                        value={
                            slug ||
                            (title
                                ? title
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/^-+|-+$/g, "")
                                : "")
                        }
                        disabled
                        className={`${inputClass} bg-cat-frappe-surface1/30 dark:bg-cat-frappe-surface0/30 cursor-not-allowed`}
                    />
                </Field>

                <Field label="Hero Image" hint="Banner image for the article header.">
                    <FileUpload
                        onChange={(files) => {
                            const file = files?.[0];
                            if (file) onHeroImageUpload(file);
                        }}
                    />
                    {heroImageUrl && (
                        <div className="mt-2">
                            <img
                                src={heroImageUrl}
                                alt="Hero preview"
                                className="h-20 w-full object-cover rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40"
                            />
                        </div>
                    )}
                </Field>
            </Section>

            {/* SEO Section */}
            <Section title="SEO Settings" defaultOpen={false}>
                <Field label="SEO Title" hint="Appears in search results.">
                    <input
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Defaults to article title"
                        className={inputClass}
                    />
                </Field>

                <Field label="SEO Description" hint="Short snippet for search engines.">
                    <input
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Defaults to summary"
                        className={inputClass}
                    />
                </Field>

                <Field label="SEO Keywords">
                    <div className="flex gap-2">
                        <input
                            value={seoKeywords}
                            onChange={(e) => {
                                setSeoAutoKeywords(false);
                                setSeoKeywords(e.target.value);
                            }}
                            placeholder="Auto-generated unless overridden"
                            className={`flex-1 ${inputClass}`}
                            disabled={seoAutoKeywords}
                        />
                        <label className="inline-flex items-center gap-1 text-xs shrink-0 px-2 py-1 rounded-lg border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/60 dark:bg-cat-frappe-mantle/60 cursor-pointer hover:bg-white/80 dark:hover:bg-cat-frappe-mantle/80 transition-colors">
                            <input
                                type="checkbox"
                                className="accent-cat-frappe-yellow"
                                checked={seoAutoKeywords}
                                onChange={(e) => setSeoAutoKeywords(e.target.checked)}
                            />
                            Auto
                        </label>
                    </div>
                </Field>
            </Section>

            {/* Display Options */}
            <Section title="Display Options" defaultOpen={false}>
                <label className="flex items-center cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={isSpanTwo}
                        onChange={() => setIsSpanTwo(!isSpanTwo)}
                        className="sr-only peer"
                    />
                    <div className="relative w-10 h-5 bg-cat-frappe-overlay2/30 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cat-frappe-yellow/30 rounded-full peer dark:bg-cat-frappe-surface0 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cat-frappe-surface1 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cat-frappe-yellow"></div>
                    <span className="ml-3 text-xs font-medium text-cat-frappe-base dark:text-cat-frappe-text group-hover:text-cat-frappe-peach transition-colors">
                        Span Two Columns
                    </span>
                </label>
                <p className="text-[10px] mt-1 text-cat-frappe-subtext0 dark:text-cat-frappe-overlay1">
                    Display as featured post on home grid.
                </p>
            </Section>

            {/* Tags Section */}
            <Section title="Tags">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-cat-frappe-subtext0">Manage article tags</span>
                    <button
                        type="button"
                        onClick={() => setIsEditingTags((v) => !v)}
                        className="text-[10px] rounded-full border px-2 py-0.5 bg-white/60 dark:bg-cat-frappe-surface0 border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0/80 transition-colors"
                    >
                        {isEditingTags ? "✓ Done" : "⚙️ Edit"}
                    </button>
                </div>

                {/* Selected tags */}
                <div className="mb-3">
                    <div className="text-[10px] text-cat-frappe-subtext0 mb-1">Selected:</div>
                    <div className="flex flex-wrap gap-1.5 min-h-[28px] p-2 rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 bg-white/40 dark:bg-cat-frappe-mantle/40">
                        {selectedTagIds.size === 0 ? (
                            <span className="text-[10px] text-cat-frappe-subtext0 italic">
                                No tags selected
                            </span>
                        ) : (
                            Array.from(selectedTagIds).map((id) => {
                                const tag = availableTags.find((t) => t.id === id);
                                if (!tag) return null;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => removeTagFromPost(id)}
                                        className="inline-flex items-center gap-1 h-6 leading-none rounded-full px-2.5 py-0 text-[10px] font-semibold border hover:opacity-80 transition-opacity"
                                        style={{
                                            backgroundColor: tag.color_bg || "#ef9f76",
                                            color: tag.color_text || "#303446",
                                            borderColor: `${tag.color_text || "#303446"}22`,
                                        }}
                                        title={`Remove #${tag.name}`}
                                    >
                                        #{tag.name}
                                        <span className="text-[8px]">✕</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Available tags */}
                <div className="mb-3">
                    <div className="text-[10px] text-cat-frappe-subtext0 mb-1">
                        Available (click to add):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {availableTags
                            .filter((t) => !selectedTagIds.has(t.id))
                            .map((t) => (
                                <div key={t.id} className="relative inline-flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => addTagToPost(t.id)}
                                        className="inline-flex items-center gap-1 h-6 leading-none rounded-full px-2.5 py-0 text-[10px] font-semibold border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/60 dark:bg-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors"
                                        style={{ color: t.color_text || "#303446" }}
                                        title={`Add #${t.name}`}
                                    >
                                        #{t.name}
                                        <span className="text-[8px]">+</span>
                                    </button>
                                    {isEditingTags && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                requestDeleteTag(t);
                                            }}
                                            className="ml-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full border border-cat-frappe-red bg-cat-frappe-red text-white hover:opacity-90 transition-opacity"
                                            title="Delete tag globally"
                                        >
                                            <IconTrash size={10} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        {availableTags.filter((t) => !selectedTagIds.has(t.id)).length === 0 && (
                            <span className="text-[10px] text-cat-frappe-subtext0 italic">
                                All tags selected
                            </span>
                        )}
                    </div>
                </div>

                {/* Create new tag */}
                <div className="pt-2 border-t border-cat-frappe-surface1/30 dark:border-cat-frappe-surface0/30">
                    <div className="text-[10px] text-cat-frappe-subtext0 mb-2">Create new tag:</div>
                    <div className="flex gap-2 mb-2">
                        <input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Tag name"
                            className={`flex-1 ${inputClass} text-xs py-1.5`}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/80 dark:bg-cat-frappe-surface0/80 text-xs hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors"
                                >
                                    <span
                                        className="inline-block w-3 h-3 rounded-full border"
                                        style={{
                                            backgroundColor: newTagBg,
                                            borderColor: `${newTagFg}22`,
                                        }}
                                    />
                                    <IconChevronDown size={12} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuLabel className="text-xs">Theme presets</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup className="max-h-48 overflow-y-auto">
                                    {TAG_COLOR_PRESETS.map((p, idx) => (
                                        <DropdownMenuItem
                                            key={p.name}
                                            onClick={() => {
                                                setSelectedPreset(idx);
                                                setNewTagBg(p.bg);
                                                setNewTagFg(p.text);
                                            }}
                                            className="text-xs"
                                        >
                                            <span
                                                className="inline-block w-3 h-3 rounded-full border mr-2"
                                                style={{
                                                    backgroundColor: p.bg,
                                                    borderColor: `${p.text}22`,
                                                }}
                                            />
                                            <span className="flex-1">{p.name}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="text-xs">Custom</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-48 p-2">
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-[10px] mb-1">Background</label>
                                                <input
                                                    type="text"
                                                    value={newTagBg}
                                                    onChange={(e) => setNewTagBg(e.target.value)}
                                                    className="w-full px-2 py-1 border rounded text-xs bg-white/80 dark:bg-cat-frappe-base"
                                                    placeholder="#hex"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] mb-1">Text</label>
                                                <input
                                                    type="text"
                                                    value={newTagFg}
                                                    onChange={(e) => setNewTagFg(e.target.value)}
                                                    className="w-full px-2 py-1 border rounded text-xs bg-white/80 dark:bg-cat-frappe-base"
                                                    placeholder="#hex"
                                                />
                                            </div>
                                        </div>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateTag}
                        className="w-full px-3 py-1.5 rounded-lg border border-cat-frappe-peach/60 bg-cat-frappe-peach/10 text-cat-frappe-peach text-xs font-medium hover:bg-cat-frappe-peach/20 transition-colors"
                    >
                        Create Tag
                    </button>
                </div>
            </Section>
        </div>
    );

    // Desktop variant: side panel
    if (isDesktop) {
        return (
            <div
                className={`h-full flex flex-col transition-all duration-300 ${isOpen ? "w-full" : "w-12"
                    }`}
            >
                {/* Header with toggle */}
                <div className="flex items-center justify-between px-3 py-3 border-b border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 bg-white/40 dark:bg-cat-frappe-mantle/40">
                    {isOpen && (
                        <div className="flex items-center gap-2">
                            <IconSettings size={16} className="text-cat-frappe-peach" />
                            <span className="text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow">
                                Settings
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-cat-frappe-surface1/40 dark:hover:bg-cat-frappe-surface0/40 transition-colors"
                        title={isOpen ? "Collapse settings" : "Expand settings"}
                    >
                        {isOpen ? (
                            <IconChevronUp size={16} className="rotate-[-90deg]" />
                        ) : (
                            <IconSettings size={16} className="text-cat-frappe-peach" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div
                    className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                >
                    {panelContent}
                </div>
            </div>
        );
    }

    // Mobile variant: collapsible accordion
    return (
        <div className="mb-4">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-cat-frappe-mantle/60 backdrop-blur-md border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 shadow-sm hover:shadow-md transition-all"
            >
                <div className="flex items-center gap-2">
                    <IconSettings size={18} className="text-cat-frappe-peach" />
                    <span className="text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-yellow">
                        Article Settings
                    </span>
                </div>
                {isOpen ? (
                    <IconChevronUp size={18} className="text-cat-frappe-subtext0" />
                ) : (
                    <IconChevronDown size={18} className="text-cat-frappe-subtext0" />
                )}
            </button>

            <div
                className={`mt-2 rounded-xl bg-white/60 dark:bg-cat-frappe-mantle/60 backdrop-blur-md border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 shadow-lg overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-transparent"
                    }`}
            >
                {panelContent}
            </div>
        </div>
    );
}
