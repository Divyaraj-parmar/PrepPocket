
function TabToggle({ activeTab, setActiveTab }) {
  return (
    <div className="tab-toggle-container">
      <div className={`tab-slider ${activeTab === 'questions' ? 'slide-right' : ''}`} />
      <button
        type="button"
        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
      >
        <svg
          className="tab-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Notes</span>
      </button>
      <button
        type="button"
        className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
        onClick={() => setActiveTab('questions')}
      >
        <svg
          className="tab-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Questions</span>
      </button>
    </div>
  );
}

export default TabToggle;
