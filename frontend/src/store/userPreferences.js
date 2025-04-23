// Simple in-memory store for user preferences and decisions
class UserPreferencesStore {
  constructor() {
    this.preferences = {
      acceptedStrategies: [],
      rejectedStrategies: [],
      investmentInterests: [],
      riskPreference: 'medium', // low, medium, high
      costPreference: 'medium', // low, medium, high
      lastDecisions: [], // Last 5 decisions
<<<<<<< HEAD
      strategyPreferences: {} // Strategy type preferences
=======
      strategyPreferences: {}, // Strategy type preferences
      investmentGoal: 'maximize_roi' // Default goal: maximize_roi, reduce_vacancies, longterm_value
>>>>>>> origin/main
    };
  }

  // Add a decision to the store
  addDecision(unitId, strategy, decision) {
    const decisionRecord = {
      unitId,
      strategy,
      decision,
      timestamp: new Date().toISOString()
    };

    if (decision === 'accept') {
      this.preferences.acceptedStrategies.push(decisionRecord);
    } else {
      this.preferences.rejectedStrategies.push(decisionRecord);
    }

    // Update last decisions (keep only last 5)
    this.preferences.lastDecisions.unshift(decisionRecord);
    this.preferences.lastDecisions = this.preferences.lastDecisions.slice(0, 5);

    // Update strategy preferences
    if (!this.preferences.strategyPreferences[strategy]) {
      this.preferences.strategyPreferences[strategy] = { accept: 0, reject: 0 };
    }
    this.preferences.strategyPreferences[strategy][decision]++;

    // Update risk and cost preferences based on decisions
    this.updatePreferences();
  }

  // Add investment interest
  addInvestmentInterest(investment) {
    this.preferences.investmentInterests.push({
      ...investment,
      timestamp: new Date().toISOString()
    });
  }

  // Get user's preferred strategies
  getPreferredStrategies() {
    return Object.entries(this.preferences.strategyPreferences)
      .sort(([, a], [, b]) => (b.accept - b.reject) - (a.accept - a.reject))
      .map(([strategy]) => strategy);
  }

  // Get last decisions
  getLastDecisions() {
    return this.preferences.lastDecisions;
  }

  // Get active investment interests
  getActiveInvestmentInterests() {
    return this.preferences.investmentInterests;
  }

  // Update risk and cost preferences based on decisions
  updatePreferences() {
    const recentDecisions = this.preferences.lastDecisions.slice(0, 10);
<<<<<<< HEAD
    
=======

>>>>>>> origin/main
    // Calculate risk preference
    const riskCounts = { low: 0, medium: 0, high: 0 };
    recentDecisions.forEach(decision => {
      if (decision.strategy.includes('Low Risk')) riskCounts.low++;
      else if (decision.strategy.includes('High Risk')) riskCounts.high++;
      else riskCounts.medium++;
    });
<<<<<<< HEAD
    
=======

>>>>>>> origin/main
    this.preferences.riskPreference = Object.entries(riskCounts)
      .sort(([, a], [, b]) => b - a)[0][0];

    // Calculate cost preference
    const costCounts = { low: 0, medium: 0, high: 0 };
    recentDecisions.forEach(decision => {
      if (decision.strategy.includes('Low Cost')) costCounts.low++;
      else if (decision.strategy.includes('High Cost')) costCounts.high++;
      else costCounts.medium++;
    });
<<<<<<< HEAD
    
=======

>>>>>>> origin/main
    this.preferences.costPreference = Object.entries(costCounts)
      .sort(([, a], [, b]) => b - a)[0][0];
  }

  // Get user's risk preference
  getRiskPreference() {
    return this.preferences.riskPreference;
  }

  // Get user's cost preference
  getCostPreference() {
    return this.preferences.costPreference;
  }
<<<<<<< HEAD
=======

  // Set user's investment goal
  setInvestmentGoal(goal) {
    this.preferences.investmentGoal = goal;
    // In a real application, this would save to localStorage or a backend API
    console.log(`Investment goal set to: ${goal}`);
    return goal;
  }

  // Get user's investment goal
  getInvestmentGoal() {
    return this.preferences.investmentGoal;
  }
>>>>>>> origin/main
}

// Create a singleton instance
const userPreferencesStore = new UserPreferencesStore();

<<<<<<< HEAD
export default userPreferencesStore; 
=======
export default userPreferencesStore;
>>>>>>> origin/main
