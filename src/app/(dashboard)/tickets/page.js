"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiFilter, FiSearch, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { ticketsAPI } from '@/api/api';
import '@/styles/Tickets.css';

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await ticketsAPI.getAll();
            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#ef4444';
            case 'pending': return '#f59e0b';
            case 'resolved': return '#10b981';
            case 'closed': return '#64748b';
            default: return '#cbd5e1';
        }
    };

    return (
        <div className="tickets-container">
            <header className="tickets-header">
                <div>
                    <h1 className="page-title">Service Desk</h1>
                    <p className="page-subtitle">Track and resolve customer support requests.</p>
                </div>
                <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiFilter /> Filter
                    </button>
                    <button className="btn btn-primary flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> New Ticket
                    </button>
                </div>
            </header>

            <div className="tickets-stats" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                <div className="stat-card card" style={{ flex: 1 }}>
                    <div className="stat-label">All Active</div>
                    <div className="stat-value">{tickets.filter(t => t.status !== 'closed').length}</div>
                </div>
                <div className="stat-card card" style={{ flex: 1 }}>
                    <div className="stat-label">High Priority</div>
                    <div className="stat-value">{tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length}</div>
                </div>
                <div className="stat-card card" style={{ flex: 1 }}>
                    <div className="stat-label">Resolved Today</div>
                    <div className="stat-value">0</div>
                </div>
            </div>

            <div className="ticket-list-card card">
                <table className="ticket-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Contact</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length > 0 ? tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>
                                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{ticket.subject}</div>
                                    <div className="text-xs text-muted" style={{ color: 'var(--text-secondary)' }}>ID: #{ticket.id}</div>
                                </td>
                                <td>{ticket.first_name ? `${ticket.first_name} ${ticket.last_name}` : 'Unknown'}</td>
                                <td>
                                    <span className={`priority-badge priority-${ticket.priority}`}>
                                        {ticket.priority}
                                    </span>
                                </td>
                                <td>
                                    <div className="status-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div
                                            className="status-dot"
                                            style={{ backgroundColor: getStatusColor(ticket.status), width: '8px', height: '8px', borderRadius: '50%' }}
                                        />
                                        {ticket.status.toUpperCase()}
                                    </div>
                                </td>
                                <td>{ticket.assigned_to_name || 'Unassigned'}</td>
                                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-muted" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                    No support tickets found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
