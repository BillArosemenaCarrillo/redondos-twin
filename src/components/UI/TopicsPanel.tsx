"use client";
import React from 'react';

export interface Topic {
    id: string;
    title: string;
    description?: string;
    status: 'Open' | 'In Progress' | 'Done' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    type: 'Issue' | 'Clash' | 'Request';
    assignee?: string;
    dueDate?: string;
}

interface TopicsPanelProps {
    topics: Topic[];
    onSelectTopic: (topic: Topic) => void;
    onCreateTopic: () => void;
}

export const TopicsPanel: React.FC<TopicsPanelProps> = ({ topics, onSelectTopic, onCreateTopic }) => {

    const getStatusColor = (status: Topic['status']) => {
        switch (status) {
            case 'Open': return 'bg-blue-500';
            case 'In Progress': return 'bg-yellow-500';
            case 'Done': return 'bg-green-500';
            case 'Closed': return 'bg-gray-500';
        }
    };

    const getPriorityColor = (priority: Topic['priority']) => {
        switch (priority) {
            case 'Critical': return 'bg-red-600 text-white';
            case 'High': return 'bg-red-100 text-red-600';
            case 'Medium': return 'bg-orange-100 text-orange-600';
            case 'Low': return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{topics.length} Topics</span>
                <button
                    onClick={onCreateTopic}
                    className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                >
                    <span>+</span> New
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        onClick={() => onSelectTopic(topic)}
                        className="p-3 bg-white border border-gray-100 rounded-lg hover:border-cyan-400 cursor-pointer shadow-sm group transition-all"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{topic.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPriorityColor(topic.priority)}`}>
                                {topic.priority}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${getStatusColor(topic.status)}`} />
                            <span>{topic.status}</span>
                            <span className="hidden group-hover:inline text-gray-300">•</span>
                            <span className="hidden group-hover:inline">{topic.type}</span>
                        </div>
                    </div>
                ))}

                {topics.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <div className="text-3xl mb-2">💬</div>
                        <p className="text-xs text-gray-400">No topics found</p>
                    </div>
                )}
            </div>
        </div>
    );
};
