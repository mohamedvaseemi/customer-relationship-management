import { useState, useEffect, useMemo } from 'react';
import { dealsAPI } from '../api/api';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDollarSign,
    FiGrid, FiList, FiChevronRight, FiAlertCircle, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Leads.css'; // Reusing styles

const DEAL_STAGES = [
    { id: 'prospecting', title: 'Prospecting', color: '#6366f1' },
    { id: 'qualification', title: 'Qualification', color: '#f59e0b' },
    { id: 'proposal', title: 'Proposal', color: '#0ea5e9' },
    { id: 'negotiation', title: 'Negotiation', color: '#ec4899' },
    { id: 'closed_won', title: 'Closed Won', color: '#10b981' },
    { id: 'closed_lost', title: 'Closed Lost', color: '#ef4444' }
];

const Deals = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        currency: 'USD',
        stage: 'prospecting',
        probability: 50,
        expected_close_date: '',
        notes: ''
    });

    useEffect(() => {
        loadDeals();
    }, [searchTerm, stageFilter]);

    const loadDeals = async () => {
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (stageFilter) params.stage = stageFilter;

            const response = await dealsAPI.getAll(params);
            setDeals(response.data.deals);
        } catch (error) {
            console.error('Failed to load deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupedDeals = useMemo(() => {
        const groups = {};
        DEAL_STAGES.forEach(stage => groups[stage.id] = []);
        deals.forEach(deal => {
            if (groups[deal.stage]) {
                groups[deal.stage].push(deal);
            }
        });
        return groups;
    }, [deals]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedDeal) {
                await dealsAPI.update(selectedDeal.id, formData);
            } else {
                await dealsAPI.create(formData);
            }
            setShowModal(false);
            resetForm();
            loadDeals();
        } catch (error) {
            console.error('Failed to save deal:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            try {
                await dealsAPI.delete(id);
                loadDeals();
            } catch (error) {
                console.error('Failed to delete deal:', error);
            }
        }
    };

    const handleEdit = (deal) => {
        setSelectedDeal(deal);
        setFormData({
            name: deal.name,
            amount: deal.amount,
            currency: deal.currency || 'USD',
            stage: deal.stage,
            probability: deal.probability,
            expected_close_date: deal.expected_close_date ? deal.expected_close_date.split('T')[0] : '',
            notes: deal.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setSelectedDeal(null);
        setFormData({
            name: '',
            amount: '',
            currency: 'USD',
            stage: 'prospecting',
            probability: 50,
            expected_close_date: '',
            notes: ''
        });
    };

    return (
        <div className="leads-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Deals Pipeline</h1>
                    <p className="page-subtitle">Manage your sales opportunities and track progress.</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle card">
                        <button
                            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            <FiGrid /> Board
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FiList /> List
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> New Deal
                    </button>
                </div>
            </div>

            <div className="filters-section card">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select className="input" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                        <option value="">All Stages</option>
                        {DEAL_STAGES.map(stage => (
                            <option key={stage.id} value={stage.id}>{stage.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : viewMode === 'kanban' ? (
                <div className="kanban-board">
                    {DEAL_STAGES.map(stage => (
                        <div key={stage.id} className="kanban-column">
                            <div className="column-header">
                                <h3 className="column-title">
                                    <span className="stage-dot" style={{ backgroundColor: stage.color }}></span>
                                    {stage.title}
                                    <span className="count-badge">{groupedDeals[stage.id].length}</span>
                                </h3>
                                <div className="column-value">
                                    ${groupedDeals[stage.id].reduce((acc, deal) => acc + parseFloat(deal.amount || 0), 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="column-content">
                                {groupedDeals[stage.id].map(deal => (
                                    <motion.div
                                        layoutId={deal.id}
                                        key={deal.id}
                                        className="kanban-card card"
                                        onClick={() => handleEdit(deal)}
                                    >
                                        <div className="card-top">
                                            <span className="lead-company">{deal.first_name ? `${deal.first_name} ${deal.last_name}` : 'Unknown Contact'}</span>
                                        </div>
                                        <h4 className="lead-title">{deal.name}</h4>
                                        <div className="card-footer">
                                            <div className="lead-value">
                                                <FiDollarSign /> {parseFloat(deal.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="probability-text">{deal.probability}%</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="table-container card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Deal Name</th>
                                <th>Amount</th>
                                <th>Stage</th>
                                <th>Probability</th>
                                <th>Closing Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(deal => (
                                <tr key={deal.id}>
                                    <td>
                                        <div className="name-text">{deal.name}</div>
                                        <div className="position-text">{deal.first_name} {deal.last_name}</div>
                                    </td>
                                    <td><FiDollarSign /> {parseFloat(deal.amount || 0).toLocaleString()}</td>
                                    <td>
                                        <div className="status-badge-alt" style={{ backgroundColor: DEAL_STAGES.find(s => s.id === deal.stage)?.color + '20', color: DEAL_STAGES.find(s => s.id === deal.stage)?.color }}>
                                            {deal.stage.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td>{deal.probability}%</td>
                                    <td>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => handleEdit(deal)}><FiEdit2 /></button>
                                            <button className="btn-icon text-danger" onClick={() => handleDelete(deal.id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedDeal ? 'Edit Deal' : 'New Deal'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="input-field">
                                        <label>Deal Name</label>
                                        <input
                                            type="text"
                                            className="input-alt"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Amount</label>
                                        <input
                                            type="number"
                                            className="input-alt"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Stage</label>
                                        <select
                                            className="select-alt"
                                            value={formData.stage}
                                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                                        >
                                            {DEAL_STAGES.map(stage => (
                                                <option key={stage.id} value={stage.id}>{stage.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field">
                                        <label>Probability (%)</label>
                                        <input
                                            type="number"
                                            className="input-alt"
                                            value={formData.probability}
                                            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                                            min="0" max="100"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label>Expected Close Date</label>
                                        <input
                                            type="date"
                                            className="input-alt"
                                            value={formData.expected_close_date}
                                            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{selectedDeal ? 'Update Deal' : 'Create Deal'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Deals;

