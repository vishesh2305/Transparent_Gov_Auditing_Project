import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, AlertTriangle, Cpu, FileText, GitBranch, Users, Search, Sparkles, Loader, MessageSquareQuote, Edit, UserCheck, TestTube2, Network, Rows, X, Lightbulb, BookOpen, Mail, Info, ChevronsRight, Beaker, Wrench } from 'lucide-react';

// --- MOCK DATA ---
const auditedSystems = [
  {
    id: 'welfare-dist-001',
    name: 'National Welfare Distribution AI',
    agency: 'Ministry of Social Justice',
    status: 'Bias Detected',
    fairnessScore: 72,
    lastAudit: '2024-07-10',
    description: 'AI model to determine eligibility and allocation of national welfare benefits.',
    biasDetails: {
      demographic: 'Geographic Location',
      disparity: 'Urban vs. Rural',
      impact: 'Applicants from rural areas have a 18% lower approval rate compared to urban applicants with similar profiles.',
    },
    xaiExplanation: {
      title: 'Key Factors in Decision Making',
      factors: [
        { name: 'Income Level', importance: 0.35 },
        { name: 'Household Size', importance: 0.25 },
        { name: 'Geographic Location', importance: 0.20 },
        { name: 'Employment Status', importance: 0.15 },
        { name: 'Previous Aid', importance: 0.05 },
      ],
    },
    blockchainTx: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    dataSource: 'National Citizen Database v3.2',
    algorithmVersion: 'WelfareNet-v1.4'
  },
  {
    id: 'loan-approval-002',
    name: 'Agri-Loan Approval System',
    agency: 'Ministry of Agriculture',
    status: 'Fair',
    fairnessScore: 95,
    lastAudit: '2024-06-22',
    description: 'Automated system for processing and approving agricultural loans for small-scale farmers.',
     biasDetails: {
      demographic: 'N/A',
      disparity: 'N/A',
      impact: 'No significant bias detected across monitored demographics.',
    },
    xaiExplanation: {
      title: 'Key Factors in Decision Making',
      factors: [
        { name: 'Credit Score', importance: 0.40 },
        { name: 'Land Ownership', importance: 0.30 },
        { name: 'Crop Type', importance: 0.15 },
        { name: 'Past Yields', importance: 0.10 },
        { name: 'Loan Amount', importance: 0.05 },
      ],
    },
    blockchainTx: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a',
    dataSource: 'Farmer Registry 2023-Q4',
    algorithmVersion: 'AgriCredit-v2.1'
  },
  {
    id: 'resource-alloc-003',
    name: 'Public Resource Allocation',
    agency: 'Urban Development Authority',
    status: 'Bias Detected',
    fairnessScore: 81,
    lastAudit: '2024-07-01',
    description: 'Model for allocating public resources like sanitation services and infrastructure projects.',
     biasDetails: {
      demographic: 'Socio-economic Status',
      disparity: 'Low-income vs. High-income Neighborhoods',
      impact: 'High-income neighborhoods are prioritized for infrastructure upgrades 12% more often than low-income areas.',
    },
    xaiExplanation: {
      title: 'Key Factors in Decision Making',
      factors: [
        { name: 'Population Density', importance: 0.30 },
        { name: 'Existing Infrastructure', importance: 0.28 },
        { name: 'Tax Revenue', importance: 0.22 },
        { name: 'Citizen Petitions', importance: 0.15 },
        { name: 'Political Zoning', importance: 0.05 },
      ],
    },
    blockchainTx: '0xabc123def456ghi789jkl0mno1pqr2stu3vwx',
    dataSource: 'Municipal Records 2023',
    algorithmVersion: 'UrbanPlan-v3.0'
  },
];

const PIE_COLORS = ['#0088FE', '#FF8042'];

// --- Gemini API Call Function ---
const callGemini = async (prompt) => {
    // IMPORTANT: Reads the API key from the .env file.
    // The user must create a .env file in the project root and add:
    // REACT_APP_GEMINI_API_KEY=YOUR_API_KEY
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
        return "Error: API key is missing. Please create a .env file in your project root and add your REACT_APP_GEMINI_API_KEY.";
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("API Error:", errorBody);
        throw new Error(`API call failed with status: ${response.status}. ${errorBody.error.message}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected response structure:", result);
        return "Could not generate a valid response from the AI. The response structure was unexpected.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return `An error occurred while contacting the AI service: ${error.message}`;
    }
};

// --- UI COMPONENTS ---

const Header = ({ setPage }) => (
  <header className="bg-white shadow-md sticky top-0 z-40">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setPage('home')}>
        <Cpu className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">TransparentGov AI</h1>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('home')}} className="text-gray-600 hover:text-blue-600">Audits</a>
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('sandbox')}} className="text-gray-600 hover:text-blue-600">Policy Sandbox</a>
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('remediation')}} className="text-gray-600 hover:text-blue-600">Remediation Simulator</a>
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('about')}} className="text-gray-600 hover:text-blue-600">About</a>
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('resources')}} className="text-gray-600 hover:text-blue-600">Resources</a>
        <a href="#" onClick={(e) => {e.preventDefault(); setPage('contact')}} className="text-gray-600 hover:text-blue-600">Contact</a>
      </nav>
    </div>
  </header>
);

const HeroSection = () => (
  <div className="bg-blue-50 py-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Building Trust in Public AI</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        We empower citizens and governments with transparency and accountability in AI decision-making through independent audits and immutable blockchain records.
      </p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
  switch (status) {
    case 'Bias Detected':
      return <span className={`${baseClasses} bg-red-100 text-red-800`}><AlertTriangle className="inline w-4 h-4 mr-1" />{status}</span>;
    case 'Fair':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}><ShieldCheck className="inline w-4 h-4 mr-1" />{status}</span>;
    case 'Needs Review':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}><Search className="inline w-4 h-4 mr-1" />{status}</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

const AuditCard = ({ system, onSelect, isCompareMode, onSelectForCompare, isSelected }) => (
  <div 
    className={`bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 p-6 relative ${isCompareMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-2 ring-pink-500' : ''}`}
    onClick={() => isCompareMode ? onSelectForCompare(system.id) : onSelect(system)}
  >
    {isCompareMode && (
      <div className="absolute top-2 right-2">
        <input 
          type="checkbox" 
          checked={isSelected} 
          readOnly 
          className="h-5 w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
        />
      </div>
    )}
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{system.name}</h3>
      <StatusBadge status={system.status} />
    </div>
    <p className="text-sm text-gray-500 mb-4">{system.agency}</p>
    <p className="text-gray-600 mb-4">{system.description}</p>
    <div className="flex justify-between items-center text-sm text-gray-500">
      <span>Fairness Score: <span className="font-bold text-blue-600">{system.fairnessScore}</span></span>
      <span>Last Audit: {system.lastAudit}</span>
    </div>
  </div>
);

const AuditDetailView = ({ system, onBack }) => {
  const pieData = [
    { name: 'Fairness', value: system.fairnessScore },
    { name: 'Bias', value: 100 - system.fairnessScore },
  ];

  const [summary, setSummary] = useState('');
  const [mitigation, setMitigation] = useState('');
  const [citizenQuery, setCitizenQuery] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [inquiryDraft, setInquiryDraft] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [fairnessSimulation, setFairnessSimulation] = useState('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isMitigationLoading, setIsMitigationLoading] = useState(false);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isInquiryLoading, setIsInquiryLoading] = useState(false);
  const [isImpactLoading, setIsImpactLoading] = useState(false);
  const [isSimulationLoading, setIsSimulationLoading] = useState(false);
  const [isRootCauseLoading, setIsRootCauseLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true); setSummary('');
    const prompt = `Explain the following AI bias report in simple, plain language for a citizen who is not a tech expert. Focus on the real-world impact. Report:\n- AI System: ${system.name}\n- Bias Finding: ${system.biasDetails.impact}\n- Monitored Group: ${system.biasDetails.demographic}\n- Unfair Outcome: ${system.biasDetails.disparity}`;
    const generatedSummary = await callGemini(prompt);
    setSummary(generatedSummary); setIsSummaryLoading(false);
  };

  const handleGenerateMitigation = async () => {
    setIsMitigationLoading(true); setMitigation('');
    const prompt = `As a policy and AI ethics expert, suggest 3-4 actionable mitigation strategies for the government agency to address the following AI bias. For each suggestion, briefly explain how it would help.\n- AI System: ${system.name} by ${system.agency}\n- Bias Finding: ${system.biasDetails.impact}\n- Monitored Group: ${system.biasDetails.demographic}\n- Unfair Outcome: ${system.biasDetails.disparity}`;
    const generatedMitigation = await callGemini(prompt);
    setMitigation(generatedMitigation); setIsMitigationLoading(false);
  };

  const handleCitizenQuery = async () => {
    if (!citizenQuery.trim()) return;
    setIsQueryLoading(true); setQueryResponse('');
    const prompt = `You are an AI ethics auditor explaining a complex topic to a concerned citizen. Use clear, simple, and respectful language. Do not make up information beyond what is provided in the report.\n\nHere is the audit report:\n- AI System: ${system.name}\n- Agency: ${system.agency}\n- Description: ${system.description}\n- Bias Finding: ${system.biasDetails.impact}\n- Key Decision Factors: ${system.xaiExplanation.factors.map(f => `${f.name} (${(f.importance * 100).toFixed(0)}% importance)`).join(', ')}\n\nHere is the citizen's question: "${citizenQuery}"\n\nBased ONLY on the audit report provided, answer the citizen's question. If the report directly addresses their concern, explain how. If the report does not have enough information to answer directly, state that clearly and explain what kind of data would be needed to investigate their specific concern.`;
    const response = await callGemini(prompt);
    setQueryResponse(response); setIsQueryLoading(false);
  };

  const handleDraftInquiry = async () => {
    setIsInquiryLoading(true); setInquiryDraft('');
    const prompt = `Draft a formal but clear letter of inquiry from a concerned citizen to a government agency regarding a biased AI system. The tone should be respectful but firm. The letter should:\n1. State the purpose of the inquiry clearly.\n2. Reference the specific AI system and the public audit report.\n3. Briefly state the key finding of the bias.\n4. Ask what steps the agency is taking to address and rectify this bias.\n5. Request a timeline for the agency's response.\n\nUse the following details:\n- AI System Name: ${system.name}\n- Government Agency: ${system.agency}\n- Audit Finding: "${system.biasDetails.impact}"\n- Placeholder for Citizen's Name and Address.`;
    const draft = await callGemini(prompt);
    setInquiryDraft(draft); setIsInquiryLoading(false);
  };
  
  const handleImpactAnalysis = async () => {
    if (!userProfile.trim()) return;
    setIsImpactLoading(true); setImpactAnalysis('');
    const prompt = `You are an impartial AI bias analyst. A citizen has provided their anonymous profile to understand how a specific government AI system might impact them. Your task is to analyze their profile against the known biases in the audit report. Frame your response carefully as a *potential* impact analysis, not a definitive outcome. Be clear, direct, and empathetic.\n\n**Audit Report Details:**\n- AI System: ${system.name}\n- Key Bias Finding: ${system.biasDetails.impact}\n- The bias is related to: ${system.biasDetails.demographic} and ${system.biasDetails.disparity}.\n\n**Citizen's Anonymous Profile:**\n"${userProfile}"\n\nBased on this, analyze and explain the potential impact. If the user's profile matches the known biased demographic, explain the risk clearly. If it doesn't, explain why their risk might be lower according to this specific audit finding. Start your response with "Based on your profile, here is a potential impact analysis:".`;
    const analysis = await callGemini(prompt);
    setImpactAnalysis(analysis); setIsImpactLoading(false);
  };

  const handleFairnessSimulation = async () => {
    setIsSimulationLoading(true); setFairnessSimulation('');
    const prompt = `You are a hopeful and creative writer. Based on the following AI audit report, write a short, positive, narrative paragraph describing what a "fairer future" might look like if the identified bias was successfully corrected. Focus on the positive human impact.\n\n**Audit Report Details:**\n- AI System: ${system.name}\n- Key Bias Finding: ${system.biasDetails.impact}\n- The bias is against: ${system.biasDetails.disparity}.\n\nDescribe a scene or a short story where this is no longer an issue. For example, what new opportunities are unlocked for people? How has community life improved?`;
    const simulation = await callGemini(prompt);
    setFairnessSimulation(simulation); setIsSimulationLoading(false);
  };

  const handleRootCauseAnalysis = async () => {
    setIsRootCauseLoading(true); setRootCauseAnalysis('');
    const prompt = `You are an expert investigative data scientist and AI ethicist. Based on the provided audit report, hypothesize the most likely root causes for the identified bias. Consider factors like data collection, feature engineering, historical biases, and proxy variables. Present your findings as a list of 2-3 likely hypotheses, each with a brief explanation.\n\n**Audit Report Details:**\n- AI System: ${system.name}\n- Agency: ${system.agency}\n- Bias Finding: ${system.biasDetails.impact}\n- Key Decision Factors: ${system.xaiExplanation.factors.map(f => `${f.name} (${(f.importance * 100).toFixed(0)}% importance)`).join(', ')}\n\nBased on this information, what are the probable root causes of this bias?`;
    const analysis = await callGemini(prompt);
    setRootCauseAnalysis(analysis); setIsRootCauseLoading(false);
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
    document.body.removeChild(textArea);
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-xl animate-fade-in">
      <button onClick={onBack} className="mb-6 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
        &larr; Back to Audits
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{system.name}</h2>
              <p className="text-md text-gray-500">{system.agency}</p>
            </div>
            <StatusBadge status={system.status} />
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500"/>Bias Analysis</h4>
            <p className="text-gray-600"><strong>Demographic Focus:</strong> {system.biasDetails.demographic}</p>
            <p className="text-gray-600"><strong>Identified Disparity:</strong> {system.biasDetails.disparity}</p>
            <p className="mt-2 text-gray-700 bg-red-50 p-3 rounded-md"><strong>Impact:</strong> {system.biasDetails.impact}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-gray-500"/>Data & Algorithm</h4>
            <p className="text-gray-600"><strong>Data Source Used:</strong> {system.dataSource}</p>
            <p className="text-gray-600"><strong>Algorithm Version:</strong> {system.algorithmVersion}</p>
          </div>

          {/* Root Cause Analysis Section */}
          <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-orange-600"/>Investigate Potential Root Causes</h4>
            <p className="text-sm text-gray-600 mb-3">Go deeper. Use AI to hypothesize the underlying reasons for the detected bias.</p>
            <button onClick={handleRootCauseAnalysis} disabled={isRootCauseLoading} className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center justify-center gap-2">
              {isRootCauseLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
              ✨ Generate Root Cause Hypotheses
            </button>
            {isRootCauseLoading && <div className="text-center p-4 mt-4">Investigating...</div>}
            {rootCauseAnalysis && <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">Potential Root Causes:</h5><div dangerouslySetInnerHTML={{ __html: rootCauseAnalysis.replace(/\n/g, '<br />') }} /></div>}
          </div>

          {/* Fairness Simulation Section */}
          <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><TestTube2 className="w-5 h-5 mr-2 text-teal-600"/>Simulate a Fairer Future</h4>
            <p className="text-sm text-gray-600 mb-3">What could happen if this bias was fixed? Let our AI generate a hypothetical, positive scenario.</p>
            <button onClick={handleFairnessSimulation} disabled={isSimulationLoading} className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-teal-300 flex items-center justify-center gap-2">
              {isSimulationLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
              ✨ Run Fairness Simulation
            </button>
            {isSimulationLoading && <div className="text-center p-4 mt-4">Imagining a better future...</div>}
            {fairnessSimulation && <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">A Vision of a Fairer Future:</h5><p className="italic">{fairnessSimulation}</p></div>}
          </div>

          {/* Gemini Features Section */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Sparkles className="w-5 h-5 mr-2 text-blue-500"/>AI-Powered Insights</h4>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center gap-2">
                {isSummaryLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                ✨ Generate Summary
              </button>
              <button onClick={handleGenerateMitigation} disabled={isMitigationLoading} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center justify-center gap-2">
                {isMitigationLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                ✨ Suggest Actions
              </button>
            </div>
            {isSummaryLoading && <div className="text-center p-4">Generating summary...</div>}
            {summary && <div className="bg-white p-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">Summary for Citizens:</h5><p>{summary}</p></div>}
            
            {isMitigationLoading && <div className="text-center p-4 mt-4">Generating suggestions...</div>}
            {mitigation && <div className="bg-white p-4 mt-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">Recommended Actions:</h5><div dangerouslySetInnerHTML={{ __html: mitigation.replace(/\n/g, '<br />') }} /></div>}
          </div>

          {/* Personal Impact Section */}
          <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><UserCheck className="w-5 h-5 mr-2 text-purple-600"/>Assess Your Personal Impact</h4>
            <p className="text-sm text-gray-600 mb-3">Describe your situation anonymously to see how this AI's bias might affect you.</p>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              rows="3"
              placeholder="e.g., I am a farmer from a rural district with a small land holding."
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
            />
            <button onClick={handleImpactAnalysis} disabled={isImpactLoading} className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2">
              {isImpactLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
              ✨ Analyze My Potential Impact
            </button>
            {isImpactLoading && <div className="text-center p-4 mt-4">Analyzing...</div>}
            {impactAnalysis && <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">Personal Impact Analysis:</h5><p>{impactAnalysis}</p></div>}
          </div>

          {/* Citizen Query Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><MessageSquareQuote className="w-5 h-5 mr-2 text-yellow-600"/>Ask the Auditor AI</h4>
            <p className="text-sm text-gray-600 mb-3">Have a specific question about this AI system? Ask how it might affect you or your community.</p>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
              rows="3"
              placeholder="e.g., I live in a small village. Will this system be unfair to me?"
              value={citizenQuery}
              onChange={(e) => setCitizenQuery(e.target.value)}
            />
            <button onClick={handleCitizenQuery} disabled={isQueryLoading} className="mt-3 w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-yellow-300 flex items-center justify-center gap-2">
              {isQueryLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
              ✨ Submit Question
            </button>
            {isQueryLoading && <div className="text-center p-4 mt-4">Thinking...</div>}
            {queryResponse && <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none"><h5 className="font-semibold">Auditor's Response:</h5><p>{queryResponse}</p></div>}
          </div>
          
          {/* Take Action Section */}
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Edit className="w-5 h-5 mr-2 text-red-600"/>Take Action</h4>
            <p className="text-sm text-gray-600 mb-3">Empower yourself. Use our AI assistant to draft a formal inquiry to the responsible agency based on this audit's findings.</p>
             <button onClick={handleDraftInquiry} disabled={isInquiryLoading} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 flex items-center justify-center gap-2">
              {isInquiryLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
              ✨ Draft an Inquiry to the Agency
            </button>
            {isInquiryLoading && <div className="text-center p-4 mt-4">Drafting letter...</div>}
            {inquiryDraft && (
              <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none">
                <div className="flex justify-between items-center">
                   <h5 className="font-semibold">Generated Inquiry Draft:</h5>
                   <button onClick={() => copyToClipboard(inquiryDraft)} className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">{copySuccess || 'Copy'}</button>
                </div>
                <div className="mt-2 p-4 border rounded-md bg-gray-50 whitespace-pre-wrap">{inquiryDraft}</div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-blue-500"/>Explainable AI (XAI) Report</h4>
            <p className="text-sm text-gray-600 mb-4">{system.xaiExplanation.title}</p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={system.xaiExplanation.factors} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#4B5563' }} />
                  <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem'}}/>
                  <Legend />
                  <Bar dataKey="importance" name="Importance Score" fill="#3B82F6" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6 rounded-lg text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Overall Fairness Score</h4>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
             <p className="text-5xl font-bold text-blue-600 mt-4">{system.fairnessScore}<span className="text-2xl text-gray-500">/100</span></p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><GitBranch className="w-5 h-5 mr-2 text-green-600"/>Blockchain Verification</h4>
            <p className="text-sm text-gray-600 mb-2">This audit is immutably recorded on the blockchain for public verification.</p>
            <div className="bg-white p-2 rounded break-all text-xs text-gray-500 font-mono shadow-inner">
              {system.blockchainTx}
            </div>
            <a 
              href="#" 
              onClick={(e) => {e.preventDefault(); alert('This would link to a blockchain explorer.');}}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline font-semibold"
            >
              View Transaction &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComparisonModal = ({ result, isLoading, onClose }) => {
  if (!result && !isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Audit Comparison</h3>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <Loader className="animate-spin text-pink-500" size={48} />
            <p className="mt-4 text-gray-600">Generating comparative analysis...</p>
          </div>
        ) : (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
        )}
      </div>
    </div>
  );
};

// --- NEW PAGE COMPONENTS ---

const AboutPage = () => (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">About TransparentGov AI</h2>
        <div className="prose max-w-none lg:prose-xl">
            <p>
                TransparentGov AI was founded on a simple yet powerful principle: public artificial intelligence should serve the public's interest, equitably and transparently. As governments worldwide, and particularly in India, adopt AI for critical public services, the risk of perpetuating historical biases and creating new forms of digital inequity grows. We are here to counter that risk.
            </p>
            <p>
                Our mission is to empower citizens with the tools and insights necessary to hold their governments accountable for the digital systems they deploy. We believe that trust in governance is paramount, and in the age of AI, trust can only be built on a foundation of verifiable transparency.
            </p>
            <h3 className="mt-8">Our Dual Approach</h3>
            <p>
                We combine the analytical power of AI with the immutable trust of blockchain technology.
            </p>
            <ul>
                <li><strong>Ethical AI Auditing:</strong> Our intelligent engines rigorously test public AI systems for a wide range of biases, from the obvious to the subtle. We don't just flag problems; our explainable AI (XAI) tools reveal *why* an AI made a particular decision, opening up the "black box" for public scrutiny.</li>
                <li><strong>Blockchain for Trust:</strong> An audit is only as good as its integrity. We record the results of our audits on a public, tamper-proof blockchain ledger. This ensures that findings cannot be altered or suppressed, creating an unchangeable record of an AI system's ethical performance over time.</li>
            </ul>
        </div>
    </div>
);

const MethodologyPage = () => (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Our Auditing Methodology</h2>
        <div className="prose max-w-none lg:prose-xl space-y-6">
            <p>
                Our methodology is designed to be rigorous, transparent, and holistic. We assess public AI systems across several key dimensions to ensure they are fair, accountable, and transparent.
            </p>
            <div>
                <h3 className="flex items-center"><ChevronsRight className="text-blue-500 mr-2"/>1. Fairness Assessment</h3>
                <p>We use a suite of cutting-edge fairness metrics (e.g., Demographic Parity, Equalized Odds) to test for biases across protected categories such as gender, caste, religion, and geographic location. Our tools simulate millions of decisions to identify statistically significant disparities in outcomes between different groups.</p>
            </div>
            <div>
                <h3 className="flex items-center"><ChevronsRight className="text-blue-500 mr-2"/>2. Explainable AI (XAI)</h3>
                <p>It's not enough to know that an AI is biased. We need to know why. We employ techniques like SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) to determine which input features are most influential in an AI's decisions. This helps pinpoint the source of bias, whether it's a flawed data point or a discriminatory proxy variable.</p>
            </div>
            <div>
                <h3 className="flex items-center"><ChevronsRight className="text-blue-500 mr-2"/>3. Blockchain Verification</h3>
                <p>To guarantee the integrity of our findings, a cryptographic hash of each final audit report—including the fairness scores, methodologies used, and algorithm version—is published to a public blockchain (like Polygon). This creates an immutable, time-stamped proof of the audit, preventing any unauthorized changes and ensuring anyone can verify the authenticity of the report they are viewing.</p>
            </div>
        </div>
    </div>
);

const ResourcesPage = () => (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8">Educational Resources</h2>
        <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">What is Algorithmic Bias?</h3>
                <p className="text-gray-700">Algorithmic bias occurs when a computer system reflects the implicit values of the humans who created it. In public AI, this can lead to systems that unfairly discriminate against certain groups of people, even if the creators had no intention of doing so. For example, if an AI is trained on historical loan data that shows a bias against women, the AI will learn and perpetuate that bias.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">Why is Blockchain important for audits?</h3>
                <p className="text-gray-700">Blockchain provides a decentralized, immutable ledger. When we record an audit's results on a blockchain, it's like carving them in digital stone. No one—not us, not the government agency—can go back and change the findings. This creates a permanent, trustworthy record that anyone can verify, which is the ultimate foundation for public accountability.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-2">FAQ: How can I use this platform?</h3>
                <p className="text-gray-700">Start by exploring the audits on the home page. If you find a system that concerns you, dive into the details. Use our AI-powered tools to understand the bias, see how it might affect you, and even draft a letter to the responsible agency. Your engagement is a crucial part of the accountability process.</p>
            </div>
        </div>
    </div>
);

const ContactPage = () => (
    <div className="container mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Get In Touch</h2>
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
            <form>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
                    <input type="text" id="name" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                    <input type="email" id="email" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
                    <textarea id="message" rows="5" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div className="text-center">
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Send Message
                    </button>
                </div>
            </form>
        </div>
    </div>
);

const PolicySandboxPage = () => {
    const [policyGoal, setPolicyGoal] = useState('');
    const [dataPoints, setDataPoints] = useState('');
    const [targetPopulation, setTargetPopulation] = useState('');
    const [riskReport, setRiskReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulation = async () => {
        if (!policyGoal || !dataPoints || !targetPopulation) {
            alert("Please fill out all fields to run the simulation.");
            return;
        }
        setIsLoading(true);
        setRiskReport('');
        const prompt = `You are a world-class AI ethics and public policy consultant. A government body is proposing a new AI system and has asked you to perform a pre-emptive bias and risk analysis.

**Proposed AI System Details:**
- **Policy Goal:** ${policyGoal}
- **Proposed Data Points for Decision-Making:** ${dataPoints}
- **Target Population:** ${targetPopulation}

**Your Task:**
Generate a "Pre-emptive Bias and Risk Report". Your report should be structured into the following sections:
1.  **Potential Bias Risks:** Based on the proposed data points and target population, what are the most significant risks for introducing or perpetuating bias? (e.g., risk of proxy discrimination, historical bias in data, unrepresentative data).
2.  **Data-Driven Recommendations:** What additional data points could be included to make the model fairer and more robust? What existing data points are most risky?
3.  **Ethical Implementation Guidelines:** Provide 2-3 key recommendations for the government agency to follow during the development and deployment of this AI to ensure fairness and accountability.

Your tone should be constructive and advisory.`;
        const report = await callGemini(prompt);
        setRiskReport(report);
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Policy Sandbox</h2>
            <p className="text-lg text-gray-600 max-w-3xl mb-8">
                Design fairer AI from the start. Describe a hypothetical public AI system below, and our AI ethics consultant will generate a pre-emptive report on potential biases and risks to consider before development.
            </p>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="policy-goal" className="block text-gray-700 font-bold mb-2">1. What is the primary goal of the AI system?</label>
                    <input type="text" id="policy-goal" value={policyGoal} onChange={(e) => setPolicyGoal(e.target.value)} placeholder="e.g., To fairly distribute drought relief funds to farmers." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="data-points" className="block text-gray-700 font-bold mb-2">2. What data points will the AI use to make decisions?</label>
                    <textarea id="data-points" rows="3" value={dataPoints} onChange={(e) => setDataPoints(e.target.value)} placeholder="e.g., Land size, historical crop yield, water access records, family size, district." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div>
                    <label htmlFor="target-population" className="block text-gray-700 font-bold mb-2">3. Who is the target population for this system?</label>
                    <input type="text" id="target-population" value={targetPopulation} onChange={(e) => setTargetPopulation(e.target.value)} placeholder="e.g., All farmers in the states of Punjab and Haryana." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="text-center">
                    <button onClick={handleSimulation} disabled={isLoading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center justify-center gap-2 w-full md:w-auto">
                        {isLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                        ✨ Generate Pre-emptive Bias Report
                    </button>
                </div>
            </div>

            {isLoading && <div className="text-center p-8">Generating report...</div>}
            {riskReport && (
                <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4">Pre-emptive Bias and Risk Report</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: riskReport.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
    );
};

const RemediationSimulatorPage = () => {
    const biasedSystems = auditedSystems.filter(s => s.status === 'Bias Detected');
    const [selectedSystemId, setSelectedSystemId] = useState(biasedSystems.length > 0 ? biasedSystems[0].id : '');
    const [remediationStrategy, setRemediationStrategy] = useState('');
    const [simulationResult, setSimulationResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const selectedSystem = auditedSystems.find(s => s.id === selectedSystemId);

    const handleSimulation = async () => {
        if (!selectedSystem || !remediationStrategy) {
            alert("Please select a system and propose a remediation strategy.");
            return;
        }
        setIsLoading(true);
        setSimulationResult('');

        const prompt = `You are an AI ethics simulator. A user wants to test a potential fix for a known bias in a government AI system. Analyze their proposed solution and provide a "Pros and Cons" report.

**Original System Audit:**
- **System:** ${selectedSystem.name}
- **Agency:** ${selectedSystem.agency}
- **Known Bias:** ${selectedSystem.biasDetails.impact}

**User's Proposed Remediation Strategy:**
"${remediationStrategy}"

**Your Task:**
Generate a simulation report with the following sections:
1.  **Potential Benefits:** How might this strategy successfully reduce the original bias? Be specific.
2.  **Potential Unintended Consequences:** What new biases or problems could this strategy accidentally create? Think about second-order effects. (e.g., Could it disadvantage a different group? Could it be easy to game the system?).
3.  **Overall Assessment:** Provide a concluding thought on the viability of this strategy. Is it a promising direction, or does it introduce more risk than it solves?`;

        const result = await callGemini(prompt);
        setSimulationResult(result);
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Remediation Simulator</h2>
            <p className="text-lg text-gray-600 max-w-3xl mb-8">
                Fixing AI bias is complex. Choose a biased system, propose your solution, and our AI will simulate the potential outcomes—both good and bad.
            </p>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div>
                    <label htmlFor="system-select" className="block text-gray-700 font-bold mb-2">1. Select a Biased AI System to Remediate</label>
                    <select id="system-select" value={selectedSystemId} onChange={(e) => setSelectedSystemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {biasedSystems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                {selectedSystem && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-800">Identified Bias:</p>
                        <p className="text-red-700">{selectedSystem.biasDetails.impact}</p>
                    </div>
                )}

                <div>
                    <label htmlFor="remediation-strategy" className="block text-gray-700 font-bold mb-2">2. Propose Your Remediation Strategy</label>
                    <textarea id="remediation-strategy" rows="4" value={remediationStrategy} onChange={(e) => setRemediationStrategy(e.target.value)} placeholder="e.g., Retrain the model on a dataset with a 50/50 split of urban and rural applicants. OR Ignore 'geographic location' as a feature." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                
                <div className="text-center">
                    <button onClick={handleSimulation} disabled={isLoading || !selectedSystemId || !remediationStrategy} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2 w-full md:w-auto">
                        {isLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                        ✨ Simulate Consequences
                    </button>
                </div>
            </div>

            {isLoading && <div className="text-center p-8">Running simulation...</div>}
            {simulationResult && (
                <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4">Remediation Simulation Report</h3>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: simulationResult.replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [page, setPage] = useState('home');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState('');
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparisonResult, setComparisonResult] = useState('');
  const [isCompareLoading, setIsCompareLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, selectedSystem]);

  const handleTrendAnalysis = async () => {
    setIsTrendLoading(true);
    setTrendAnalysis('');

    const reportsSummary = auditedSystems
      .filter(system => system.status !== 'Fair')
      .map(system => `- System: ${system.name}, Agency: ${system.agency}, Finding: ${system.biasDetails.impact}`)
      .join("\n");

    const prompt = `You are a government oversight analyst specializing in technology ethics. Below is a summary of findings from several independent AI audits across different government agencies. Please analyze this summary to identify high-level, systemic trends.\n\nYour analysis should look for:\n1.  **Recurring Bias Types:** Are there common themes like geographic, socio-economic, or other forms of bias appearing across multiple systems?\n2.  **Problematic Agencies:** Does one agency appear more frequently with biased systems?\n3.  **Systemic Risks:** Based on the trends, what is the biggest systemic risk to citizens from the government's current use of AI?\n\nProvide a concise, high-level report of your findings.\n\n**Consolidated Audit Findings:**\n${reportsSummary}`;

    const analysis = await callGemini(prompt);
    setTrendAnalysis(analysis);
    setIsTrendLoading(false);
  };

  const handleSelectForCompare = (id) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return prev; // Don't allow more than 2 selections
    });
  };
  
  const handleRunComparison = async () => {
    if (selectedForCompare.length !== 2) return;
    
    setIsCompareLoading(true);
    setComparisonResult('');

    const report1 = auditedSystems.find(s => s.id === selectedForCompare[0]);
    const report2 = auditedSystems.find(s => s.id === selectedForCompare[1]);

    const prompt = `You are an expert AI ethics and policy analyst. Conduct a comparative analysis of the following two government AI audit reports.

**Report 1:**
- System: ${report1.name}
- Agency: ${report1.agency}
- Fairness Score: ${report1.fairnessScore}
- Bias Finding: ${report1.biasDetails.impact}

**Report 2:**
- System: ${report2.name}
- Agency: ${report2.agency}
- Fairness Score: ${report2.fairnessScore}
- Bias Finding: ${report2.biasDetails.impact}

Please provide a concise comparison covering the following points:
1.  **Severity:** Which system appears to have a more severe or impactful bias? Why?
2.  **Commonality:** Is there a common theme in the type of bias (e.g., are both geographic, socio-economic, etc.)?
3.  **Performance:** How do their fairness scores compare and what does this imply?
4.  **Conclusion:** Briefly summarize the key difference or similarity a policymaker should be aware of.`;

    const result = await callGemini(prompt);
    setComparisonResult(result);
    setIsCompareLoading(false);
  };

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedForCompare([]); // Reset selections when toggling
  };

  const renderPage = () => {
    if (selectedSystem) {
        return <AuditDetailView system={selectedSystem} onBack={() => setSelectedSystem(null)} />;
    }
    switch(page) {
        case 'about':
            return <AboutPage />;
        case 'methodology':
            return <MethodologyPage />;
        case 'resources':
            return <ResourcesPage />;
        case 'contact':
            return <ContactPage />;
        case 'sandbox':
            return <PolicySandboxPage />;
        case 'remediation':
            return <RemediationSimulatorPage />;
        case 'home':
        default:
            return (
                <>
                    <HeroSection />
                    <div className="container mx-auto px-6 py-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Public AI Audits</h2>
                        
                        <div className="mb-8 bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><Network className="w-5 h-5 mr-2 text-indigo-600"/>System-Wide Trend Analysis</h4>
                            <p className="text-sm text-gray-600 mb-3">Analyze all audit reports to find recurring patterns and systemic risks across government agencies.</p>
                            <button onClick={handleTrendAnalysis} disabled={isTrendLoading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 flex items-center justify-center gap-2">
                            {isTrendLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                            ✨ Analyze System-Wide Trends
                            </button>
                            {isTrendLoading && <div className="text-center p-4 mt-4">Analyzing all reports...</div>}
                            {trendAnalysis && (
                            <div className="bg-white mt-4 p-4 rounded-md shadow-inner prose max-w-none">
                                <h5 className="font-semibold">Cross-Agency Trend Report:</h5>
                                <div dangerouslySetInnerHTML={{ __html: trendAnalysis.replace(/\n/g, '<br />') }} />
                            </div>
                            )}
                        </div>

                        <div className="mb-8 bg-pink-50 border border-pink-200 p-6 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-gray-800 flex items-center"><Rows className="w-5 h-5 mr-2 text-pink-600"/>Compare Audits</h4>
                                <button onClick={toggleCompareMode} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isCompareMode ? 'bg-pink-600 text-white' : 'bg-white text-pink-600 border border-pink-600'}`}>
                                {isCompareMode ? 'Cancel Comparison' : 'Start Comparison'}
                                </button>
                            </div>
                            {isCompareMode && (
                                <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-3">Select two audit reports from the list below to run a comparative analysis.</p>
                                <button onClick={handleRunComparison} disabled={selectedForCompare.length !== 2 || isCompareLoading} className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300 flex items-center justify-center gap-2">
                                    {isCompareLoading ? <Loader className="animate-spin" /> : <Sparkles size={16}/>}
                                    ✨ Run AI Comparison on {selectedForCompare.length}/2 Selected Audits
                                </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {auditedSystems.map(system => (
                            <AuditCard 
                                key={system.id} 
                                system={system} 
                                onSelect={setSelectedSystem}
                                isCompareMode={isCompareMode}
                                onSelectForCompare={handleSelectForCompare}
                                isSelected={selectedForCompare.includes(system.id)}
                            />
                            ))}
                        </div>
                    </div>
                </>
            );
    }
  }

  return (
    <div id="app-container" className="bg-gray-100 min-h-screen font-sans">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .prose p { margin-top: 0.5em; margin-bottom: 0.5em; }
        .prose h5 { margin-bottom: 0.5em; }
      `}</style>
      
      <Header setPage={setPage} />

      <main className="container mx-auto px-6 py-12">
        {renderPage()}
      </main>
      
      <ComparisonModal 
        isLoading={isCompareLoading} 
        result={comparisonResult} 
        onClose={() => setComparisonResult('')}
      />

      <footer className="bg-white mt-12 py-6 border-t">
          <div className="container mx-auto px-6 text-center text-gray-500">
              <p>&copy; 2024 TransparentGov AI. All Rights Reserved.</p>
              <p className="text-sm mt-2">Promoting Ethical Governance in the Digital Age.</p>
          </div>
      </footer>
    </div>
  );
}
