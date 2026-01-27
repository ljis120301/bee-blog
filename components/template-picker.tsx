"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Template } from '@/types/template'

interface TemplatePickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelectTemplate: (template: Template) => void
}

export function TemplatePicker({ open, onOpenChange, onSelectTemplate }: TemplatePickerProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const loadTemplates = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/templates')
            if (response.ok) {
                const data = await response.json()
                setTemplates(data.templates || [])
            }
        } catch (error) {
            console.error('Failed to load templates:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (open) {
            loadTemplates()
        }
    }, [open, loadTemplates])

    const handleSelect = (template: Template) => {
        onSelectTemplate(template)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                    <DialogDescription>
                        Select a template to insert into your content
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="text-sm text-muted-foreground">Loading templates...</span>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <span className="text-sm text-muted-foreground">No templates available</span>
                            <p className="text-xs text-muted-foreground mt-2">
                                Create templates in the admin panel
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {templates.map((template) => (
                                <Button
                                    key={template.id}
                                    variant="ghost"
                                    className="w-full justify-start text-left h-auto py-3 px-4"
                                    onClick={() => handleSelect(template)}
                                >
                                    <div>
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                            {template.content?.replace(/<[^>]*>/g, '').slice(0, 60)}...
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
