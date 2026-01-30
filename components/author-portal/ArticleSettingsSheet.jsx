"use client";

import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { IconChevronDown, IconChevronUp, IconTrash } from "@tabler/icons-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
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
        <div className="mb-6">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-cat-frappe-base dark:text-cat-frappe-yellow mb-3 hover:opacity-80 transition-opacity"
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
    <div className="mb-4">
        <label className="block text-xs font-medium text-cat-frappe-base dark:text-cat-frappe-subtext1 mb-1.5">
            {label}
        </label>
        {children}
        {hint && (
            <p className="text-[10px] mt-1 text-cat-frappe-subtext0 dark:text-cat-frappe-overlay1">
                {hint}
            </p>
        )}
    </div>
);

export default function ArticleSettingsSheet({
    // Sheet State
    isOpen,
    onOpenChange,
    // Article info
    title, // Passed for slug generation, but not editable here
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
}) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-white/95 dark:bg-cat-frappe-base/95 backdrop-blur-xl border-l border-cat-frappe-surface1/20 dark:border-cat-frappe-surface0/20 shadow-2xl z-[100]">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-cat-frappe-base dark:text-cat-frappe-yellow text-xl">Article Settings</SheetTitle>
                    <SheetDescription className="text-cat-frappe-subtext0">
                        Configure metadata, SEO, and visibility options.
                    </SheetDescription>
                </SheetHeader>

                <div className="pb-8">
                    {/* General Info */}
                    <Section title="General Information">
                        <Field label="Summary" hint="A short summary used in previews and SEO description.">
                            <textarea
                                value={dek || description}
                                onChange={(e) => {
                                    setDek(e.target.value);
                                    setDescription(e.target.value);
                                }}
                                placeholder="What is this article about?"
                                rows={4}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Slug" hint="Unique URL identifier. Auto-generated from title.">
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
                                className={`${inputClass} bg-cat-frappe-surface1/30 dark:bg-cat-frappe-surface0/30 cursor-not-allowed opacity-70`}
                            />
                        </Field>

                        <Field label="Hero Image" hint="The main banner image for the article.">
                            <FileUpload
                                onChange={(files) => {
                                    const file = files?.[0];
                                    if (file) onHeroImageUpload(file);
                                }}
                            />
                            {heroImageUrl && (
                                <div className="mt-3">
                                    <img
                                        src={heroImageUrl}
                                        alt="Hero preview"
                                        className="h-32 w-full object-cover rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40"
                                    />
                                    <div className="mt-1 text-[10px] text-cat-frappe-subtext0 truncate">{heroImageUrl}</div>
                                </div>
                            )}
                        </Field>
                    </Section>

                    {/* SEO Settings */}
                    <Section title="SEO Configuration" defaultOpen={false}>
                        <Field label="SEO Title" hint="Overrides the article title in search results.">
                            <input
                                value={seoTitle}
                                onChange={(e) => setSeoTitle(e.target.value)}
                                placeholder={title || "Article Title"}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="SEO Description" hint="Overrides the summary in search results.">
                            <input
                                value={seoDescription}
                                onChange={(e) => setSeoDescription(e.target.value)}
                                placeholder={dek || description || "Article Summary"}
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Keywords" hint="Comma-separated keywords for search engines.">
                            <div className="flex gap-2">
                                <input
                                    value={seoKeywords}
                                    onChange={(e) => {
                                        setSeoAutoKeywords(false);
                                        setSeoKeywords(e.target.value);
                                    }}
                                    placeholder="e.g. tech, coding, tutorial"
                                    className={`flex-1 ${inputClass}`}
                                    disabled={seoAutoKeywords}
                                />
                                <label className="inline-flex items-center gap-2 text-xs shrink-0 px-3 py-1 rounded-lg border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/60 dark:bg-cat-frappe-mantle/60 cursor-pointer hover:bg-white/80 dark:hover:bg-cat-frappe-mantle/80 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="accent-cat-frappe-yellow w-3.5 h-3.5"
                                        checked={seoAutoKeywords}
                                        onChange={(e) => setSeoAutoKeywords(e.target.checked)}
                                    />
                                    Auto-generate
                                </label>
                            </div>
                        </Field>
                    </Section>

                    {/* Display Options */}
                    <Section title="Display Options" defaultOpen={false}>
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 bg-white/40 dark:bg-cat-frappe-surface0/20">
                            <div className="relative flex items-center h-5">
                                <input
                                    type="checkbox"
                                    checked={isSpanTwo}
                                    onChange={() => setIsSpanTwo(!isSpanTwo)}
                                    className="peer h-4 w-4 rounded border-cat-frappe-surface1 text-cat-frappe-yellow focus:ring-cat-frappe-yellow/50"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text">Span Two Columns</span>
                                <span className="text-xs text-cat-frappe-subtext0 mt-0.5">Make this article wider on the home grid (featured style).</span>
                            </div>
                        </div>
                    </Section>

                    {/* Tags Section */}
                    <Section title="Tags & Categories">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-cat-frappe-subtext0">Manage Tags</span>
                            <button
                                type="button"
                                onClick={() => setIsEditingTags((v) => !v)}
                                className="text-[10px] rounded-full border px-3 py-1 bg-white/60 dark:bg-cat-frappe-surface0 border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0/80 transition-colors"
                            >
                                {isEditingTags ? "✓ Finish Editing" : "⚙️ Manage Tags"}
                            </button>
                        </div>

                        {/* Selected tags */}
                        <div className="mb-4">
                            <div className="text-[10px] text-cat-frappe-subtext0 mb-1.5 uppercase tracking-wider font-semibold">Active Tags</div>
                            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border border-cat-frappe-surface1/40 dark:border-cat-frappe-surface0/40 bg-white/40 dark:bg-cat-frappe-mantle/40">
                                {selectedTagIds.size === 0 ? (
                                    <span className="text-xs text-cat-frappe-subtext0 italic py-1">
                                        No tags selected. Click tags below to add them.
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
                                                className="inline-flex items-center gap-1.5 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border hover:opacity-80 transition-opacity shadow-sm"
                                                style={{
                                                    backgroundColor: tag.color_bg || "#ef9f76",
                                                    color: tag.color_text || "#303446",
                                                    borderColor: `${tag.color_text || "#303446"}22`,
                                                }}
                                                title={`Remove #${tag.name}`}
                                            >
                                                #{tag.name}
                                                <span className="text-[9px] opacity-60 hover:opacity-100">✕</span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Available tags */}
                        <div className="mb-4">
                            <div className="text-[10px] text-cat-frappe-subtext0 mb-1.5 uppercase tracking-wider font-semibold">
                                Available Tags
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableTags
                                    .filter((t) => !selectedTagIds.has(t.id))
                                    .map((t) => (
                                        <div key={t.id} className="relative inline-flex items-center group">
                                            <button
                                                type="button"
                                                onClick={() => addTagToPost(t.id)}
                                                className="inline-flex items-center gap-1.5 h-7 leading-none rounded-full px-3 py-0 text-xs font-semibold border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/60 dark:bg-cat-frappe-surface0/60 hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors"
                                                style={{ color: t.color_text || "#303446" }}
                                                title={`Add #${t.name}`}
                                            >
                                                #{t.name}
                                                <span className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity">+</span>
                                            </button>
                                            {isEditingTags && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        requestDeleteTag(t);
                                                    }}
                                                    className="absolute -top-1 -right-1 z-10 inline-flex items-center justify-center h-4 w-4 rounded-full border border-white dark:border-cat-frappe-base bg-cat-frappe-red text-white shadow-sm hover:scale-110 transition-transform"
                                                    title="Delete this tag completely"
                                                >
                                                    <IconTrash size={8} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                {availableTags.filter((t) => !selectedTagIds.has(t.id)).length === 0 && (
                                    <span className="text-xs text-cat-frappe-subtext0 italic">
                                        All available tags selected.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Create new tag */}
                        <div className="pt-3 border-t border-cat-frappe-surface1/30 dark:border-cat-frappe-surface0/30">
                            <div className="text-[10px] text-cat-frappe-subtext0 mb-2 uppercase tracking-wider font-semibold">Create New Tag</div>
                            <div className="flex gap-2 mb-2">
                                <input
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="New tag name..."
                                    className={`flex-1 ${inputClass} py-2`}
                                />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cat-frappe-surface1/60 dark:border-cat-frappe-surface0/60 bg-white/80 dark:bg-cat-frappe-surface0/80 text-xs font-medium hover:bg-white dark:hover:bg-cat-frappe-surface0 transition-colors shadow-sm"
                                        >
                                            <span
                                                className="inline-block w-3 h-3 rounded-full border"
                                                style={{
                                                    backgroundColor: newTagBg,
                                                    borderColor: `${newTagFg}22`,
                                                }}
                                            />
                                            <span className="hidden sm:inline">Color</span>
                                            <IconChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 z-[110]">
                                        <DropdownMenuLabel className="text-xs text-cat-frappe-subtext0">Quick Presets</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup className="max-h-48 overflow-y-auto p-1 grid grid-cols-2 gap-1">
                                            {TAG_COLOR_PRESETS.map((p, idx) => (
                                                <DropdownMenuItem
                                                    key={p.name}
                                                    onClick={() => {
                                                        setSelectedPreset(idx);
                                                        setNewTagBg(p.bg);
                                                        setNewTagFg(p.text);
                                                    }}
                                                    className="text-xs flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full border"
                                                        style={{
                                                            backgroundColor: p.bg,
                                                            borderColor: `${p.text}22`,
                                                        }}
                                                    />
                                                    <span>{p.name}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="text-xs">Custom Hex Codes</DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="w-48 p-3 z-[120]">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-[10px] mb-1 font-medium">Background Color</label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: newTagBg }}></div>
                                                            <input
                                                                type="text"
                                                                value={newTagBg}
                                                                onChange={(e) => setNewTagBg(e.target.value)}
                                                                className="flex-1 px-2 py-1 border rounded text-xs"
                                                                placeholder="#hex"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] mb-1 font-medium">Text Color</label>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: newTagFg }}></div>
                                                            <input
                                                                type="text"
                                                                value={newTagFg}
                                                                onChange={(e) => setNewTagFg(e.target.value)}
                                                                className="flex-1 px-2 py-1 border rounded text-xs"
                                                                placeholder="#hex"
                                                            />
                                                        </div>
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
                                className="w-full px-4 py-2 rounded-lg border border-cat-frappe-peach/40 bg-cat-frappe-peach/10 text-cat-frappe-peach text-xs font-semibold hover:bg-cat-frappe-peach/20 hover:border-cat-frappe-peach/60 transition-all shadow-sm"
                            >
                                + Create New Tag
                            </button>
                        </div>
                    </Section>
                </div>
            </SheetContent>
        </Sheet>
    );
}
