"use client";
import React, { useState, useEffect } from 'react';
import { Topic } from './TopicsPanel';

interface TopicModalProps {
    isOpen: boolean;
    topic: Topic | null; // If null, creating new
    onClose: () => void;
    onSave: (topic: Topic) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({ isOpen, topic, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Topic>>({});

    useEffect(() => {
        if (topic) {
            setFormData(topic);
        } else {
            setFormData({
                id: Math.random().toString(36).substr(2, 9),
                status: 'Open',
                priority: 'Medium',
                type: 'Issue',
                title: '',
                description: '',
                assignee: '',
                dueDate: ''
            });
        }
    }, [topic, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-[500px] h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-lg text-gray-800">{topic ? 'Edit Topic' : 'New Topic'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title *</label>
                        <input
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-cyan-500 outline-none transition-colors"
                            placeholder="e.g. Missing electrical panel..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type *</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
                            >
                                <option>Issue</option>
                                <option>Clash</option>
                                <option>Request</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status *</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
                            >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Done</option>
                                <option>Closed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 min-h-[100px] outline-none"
                            placeholder="Describe the issue in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate || ''}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white outline-none text-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned To</label>
                        <input
                            value={formData.assignee || ''}
                            onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                            placeholder="email@example.com"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                    <button
                        onClick={() => onSave(formData as Topic)}
                        className="px-6 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-800 font-medium shadow-lg shadow-black/20"
                    >
                        {topic ? 'Save Changes' : 'Create Topic'}
                    </button>
                </div>
            </div>
        </div>
    );
};
