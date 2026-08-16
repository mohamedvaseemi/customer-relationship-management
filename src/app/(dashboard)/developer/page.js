"use client";
import { useState } from 'react';
import { 
    FiCode, FiKey, FiCopy, FiCheck, FiExternalLink, 
    FiTerminal, FiLayers, FiShield, FiSend, FiUsers, 
    FiDollarSign, FiLifeBuoy, FiCheckCircle
} from 'react-icons/fi';
import Link from 'next/link';
import '@/styles/Developer.css';

const ENDPOINTS = [
    {
        id: 'leads',
        name: 'Leads API',
        icon: FiSend,
        badge: 'Core Pipeline',
        description: 'Ingest inbound leads from landing pages, contact forms, or third-party webhooks.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/leads',
                desc: 'Fetch paginated list of leads with optional status filters.',
                params: '?status=new&search=Acme',
                response: `{\n  "leads": [\n    {\n      "id": 101,\n      "title": "Enterprise Cloud License",\n      "first_name": "Jane",\n      "last_name": "Doe",\n      "email": "jane@acmecorp.com",\n      "company": "Acme Corp",\n      "value": 45000,\n      "status": "new"\n    }\n  ]\n}`
            },
            {
                method: 'POST',
                path: '/api/leads',
                desc: 'Create a new lead from an external source.',
                payload: `{\n  "first_name": "Jane",\n  "last_name": "Doe",\n  "email": "jane@acmecorp.com",\n  "phone": "+1 (555) 019-2834",\n  "company": "Acme Corp",\n  "title": "VP of Engineering",\n  "value": 45000,\n  "status": "new",\n  "source": "Website Form"\n}`,
                response: `{\n  "message": "Lead created successfully",\n  "lead": {\n    "id": 102,\n    "title": "VP of Engineering",\n    "status": "new",\n    "created_at": "2026-08-14T15:30:00Z"\n  }\n}`
            }
        ]
    },
    {
        id: 'contacts',
        name: 'Contacts API',
        icon: FiUsers,
        badge: 'Directory',
        description: 'Synchronize customer address books, phone numbers, and company titles.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/contacts',
                desc: 'List all CRM contacts matching search parameters.',
                params: '?search=john',
                response: `{\n  "contacts": [\n    {\n      "id": 45,\n      "first_name": "John",\n      "last_name": "Smith",\n      "email": "john@smith.io",\n      "phone": "+91 98765 43210",\n      "company": "Smith Logistics",\n      "position": "Procurement Lead"\n    }\n  ]\n}`
            },
            {
                method: 'POST',
                path: '/api/contacts',
                desc: 'Add a new contact to the directory.',
                payload: `{\n  "first_name": "John",\n  "last_name": "Smith",\n  "email": "john@smith.io",\n  "phone": "+91 98765 43210",\n  "company": "Smith Logistics",\n  "position": "Procurement Lead"\n}`,
                response: `{\n  "message": "Contact created",\n  "contact": { "id": 46, "first_name": "John", "last_name": "Smith" }\n}`
            }
        ]
    },
    {
        id: 'deals',
        name: 'Deals API',
        icon: FiDollarSign,
        badge: 'Revenue',
        description: 'Track deals, calculate probability weighting, and progress pipeline stages.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/deals',
                desc: 'Create an opportunity in the sales pipeline.',
                payload: `{\n  "name": "Global ERP Migration",\n  "company_name": "TechFlow Inc",\n  "amount": 120000,\n  "stage": "prospecting",\n  "probability": 60\n}`,
                response: `{\n  "message": "Deal registered",\n  "deal": { "id": 14, "name": "Global ERP Migration", "amount": 120000 }\n}`
            }
        ]
    },
    {
        id: 'tickets',
        name: 'Service Desk Tickets API',
        icon: FiLifeBuoy,
        badge: 'Support',
        description: 'Submit support requests, report issues, and automate incident dispatching.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/tickets',
                desc: 'Open a support ticket from an external portal or app.',
                payload: `{\n  "subject": "Payment Gateway Timeout",\n  "description": "User reported a timeout on transaction checkout.",\n  "priority": "high",\n  "status": "open"\n}`,
                response: `{\n  "message": "Ticket created",\n  "ticket": { "id": 8, "subject": "Payment Gateway Timeout", "status": "open" }\n}`
            }
        ]
    }
];

export default function DeveloperDocsPage() {
    const [selectedTab, setSelectedTab] = useState('leads');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [codeLang, setCodeLang] = useState('curl');

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const activeModule = ENDPOINTS.find(m => m.id === selectedTab);

    const getCodeSnippet = (lang) => {
        if (lang === 'curl') {
            return `# Ingest a lead from any external bash script or webhook
curl -X POST https://your-domain.com/api/leads \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: kib_live_your_api_key_here" \\
  -d '{
    "first_name": "Alex",
    "last_name": "Morgan",
    "email": "alex@enterprise.com",
    "company": "Enterprise Global",
    "value": 50000,
    "source": "Landing Page"
  }'`;
        }
        if (lang === 'js') {
            return `// Integration via Node.js / Browser Fetch
async function submitKibonLead(leadData) {
  const res = await fetch('https://your-domain.com/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'kib_live_your_api_key_here'
    },
    body: JSON.stringify(leadData)
  });

  const data = await res.json();
  console.log('Kibon Lead Created:', data);
}

submitKibonLead({
  first_name: "Alex",
  last_name: "Morgan",
  email: "alex@enterprise.com",
  company: "Enterprise Global",
  value: 50000
});`;
        }
        return `# Integration via Python (requests)
import requests

url = "https://your-domain.com/api/leads"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "kib_live_your_api_key_here"
}
payload = {
    "first_name": "Alex",
    "last_name": "Morgan",
    "email": "alex@enterprise.com",
    "company": "Enterprise Global",
    "value": 50000
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    };

    return (
        <div className="dev-page-container">
            {/* Header */}
            <div className="dev-header">
                <div>
                    <div className="dev-badge-row">
                        <span className="dev-badge"><FiCode /> REST API Reference</span>
                        <span className="dev-badge-version">v1.0.0</span>
                    </div>
                    <h1 className="dev-title">Kibon CRM Developer Portal</h1>
                    <p className="dev-subtitle">
                        Integrate external websites, webhooks, and third-party applications into your Kibon workspace using secure API keys.
                    </p>
                </div>
                <Link href="/settings" className="btn btn-primary dev-keys-btn">
                    <FiKey /> Manage API Keys
                </Link>
            </div>

            {/* Quick Authentication Card */}
            <div className="dev-card auth-banner-card">
                <div className="auth-card-left">
                    <div className="auth-icon-circle"><FiShield size={24} /></div>
                    <div>
                        <h3>Authentication with API Keys</h3>
                        <p>Authenticate all external requests by passing your workspace token in the <code>X-API-Key</code> request header.</p>
                    </div>
                </div>
                <div className="auth-header-pill">
                    <code>X-API-Key: kib_live_xxxxxxxxxxxxxxxxxxxx</code>
                </div>
            </div>

            {/* Quickstart Code Block */}
            <div className="dev-card quickstart-card">
                <div className="quickstart-header">
                    <div className="quickstart-title">
                        <FiTerminal /> <span>Quickstart Implementation</span>
                    </div>
                    <div className="lang-tabs">
                        {['curl', 'js', 'python'].map(lang => (
                            <button 
                                key={lang} 
                                className={`lang-tab-btn ${codeLang === lang ? 'active' : ''}`}
                                onClick={() => setCodeLang(lang)}
                            >
                                {lang === 'js' ? 'JavaScript' : lang === 'curl' ? 'cURL' : 'Python'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="code-box-wrapper">
                    <pre className="code-content"><code>{getCodeSnippet(codeLang)}</code></pre>
                    <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopy(getCodeSnippet(codeLang), 'quickstart')}
                    >
                        {copiedIndex === 'quickstart' ? <><FiCheck /> Copied</> : <><FiCopy /> Copy</>}
                    </button>
                </div>
            </div>

            {/* Module Reference Tabs & Endpoints */}
            <div className="dev-section-title">
                <FiLayers /> <span>Endpoints by Module</span>
            </div>

            <div className="dev-module-tabs">
                {ENDPOINTS.map(mod => {
                    const Icon = mod.icon;
                    return (
                        <button
                            key={mod.id}
                            className={`dev-module-btn ${selectedTab === mod.id ? 'active' : ''}`}
                            onClick={() => setSelectedTab(mod.id)}
                        >
                            <Icon size={16} />
                            <span>{mod.name}</span>
                        </button>
                    );
                })}
            </div>

            {activeModule && (
                <div className="dev-endpoints-container">
                    <div className="module-intro">
                        <span className="module-badge">{activeModule.badge}</span>
                        <p>{activeModule.description}</p>
                    </div>

                    {activeModule.endpoints.map((ep, idx) => (
                        <div key={idx} className="endpoint-card card">
                            <div className="endpoint-header">
                                <div className="endpoint-route">
                                    <span className={`http-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
                                    <code className="endpoint-path">{ep.path} {ep.params && <span className="query-params">{ep.params}</span>}</code>
                                </div>
                                <span className="endpoint-desc">{ep.desc}</span>
                            </div>

                            <div className="endpoint-body-grid">
                                {ep.payload && (
                                    <div className="payload-box">
                                        <div className="box-title">Request JSON Body</div>
                                        <pre><code>{ep.payload}</code></pre>
                                        <button className="mini-copy-btn" onClick={() => handleCopy(ep.payload, `payload-${idx}`)}>
                                            {copiedIndex === `payload-${idx}` ? <FiCheck color="#10b981" /> : <FiCopy />}
                                        </button>
                                    </div>
                                )}
                                <div className="response-box" style={{ gridColumn: !ep.payload ? '1 / -1' : 'auto' }}>
                                    <div className="box-title">Response JSON (200 / 201)</div>
                                    <pre><code>{ep.response}</code></pre>
                                    <button className="mini-copy-btn" onClick={() => handleCopy(ep.response, `resp-${idx}`)}>
                                        {copiedIndex === `resp-${idx}` ? <FiCheck color="#10b981" /> : <FiCopy />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Standard Response Codes Table */}
            <div className="dev-card response-codes-card">
                <h3>Standard Response Codes</h3>
                <div className="table-responsive">
                    <table className="dev-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Status</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>200 / 201</code></td>
                                <td><span className="status-pill success">Success</span></td>
                                <td>Request succeeded and records were created/returned.</td>
                            </tr>
                            <tr>
                                <td><code>400</code></td>
                                <td><span className="status-pill warning">Bad Request</span></td>
                                <td>Missing required parameter (e.g., missing name or email).</td>
                            </tr>
                            <tr>
                                <td><code>401</code></td>
                                <td><span className="status-pill danger">Unauthorized</span></td>
                                <td>Missing or invalid <code>X-API-Key</code> header.</td>
                            </tr>
                            <tr>
                                <td><code>404</code></td>
                                <td><span className="status-pill muted">Not Found</span></td>
                                <td>Specified ID does not exist in the database.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}