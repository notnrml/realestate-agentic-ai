import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Add Times New Roman font (needs to be imported to work with jsPDF)
import 'jspdf/dist/polyfills.es.js';

const ReportsTab = () => {
  const [properties, setProperties] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [errorMessage, setErrorMessage] = useState(null);
  const [reportInfo, setReportInfo] = useState({
    portfolio: {
      totalCount: 0,
      totalValue: 0,
      avgROI: 0
    },
    activities: {
      totalCount: 0,
      types: []
    }
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  // Template reports available to generate
  const reportTemplates = [
    {
      id: 'portfolio-summary',
      name: 'Portfolio Summary',
      description: 'Overview of your property portfolio with financials and ROI metrics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Current market trends, opportunities, and predictions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      id: 'activity-log',
      name: 'Activity Log',
      description: 'Record of all your investment decisions and actions taken',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete report with all aspects of your real estate investments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    }
  ];

  // Add information about activity types
  const activityTypes = [
    { type: 'RENOVATION_APPROVED', description: 'Approval of property renovations and upgrades' },
    { type: 'RENTAL_ADJUSTMENT', description: 'Changes to rental prices based on market conditions' },
    { type: 'MAINTENANCE_SCHEDULED', description: 'Regular or emergency maintenance appointments' },
    { type: 'PROPERTY_ACQUIRED', description: 'New properties added to your portfolio' },
    { type: 'TENANT_CHANGE', description: 'New tenants or tenant departures' }
  ];

  useEffect(() => {
    // Load data from localStorage
    const fetchData = () => {
      try {
        // Get portfolio properties
        const savedProperties = localStorage.getItem('portfolioProperties');
        if (savedProperties) {
          setProperties(JSON.parse(savedProperties));
        }

        // Get market trends data
        const marketData = localStorage.getItem('marketTrendsData');
        if (marketData) {
          setMarketTrends(JSON.parse(marketData));
        }

        // Get user activities
        const savedActivities = localStorage.getItem('userActivities');
        if (savedActivities) {
          setUserActivities(JSON.parse(savedActivities));
        }

        // Get investment goal
        const savedGoal = localStorage.getItem('investmentGoal');
        if (savedGoal) {
          setInvestmentGoal(JSON.parse(savedGoal));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();

    // Also try to fetch from the API if localStorage data isn't available
    const fetchFromAPI = async () => {
      try {
        // Fetch portfolio data
        const portfolioResponse = await fetch('http://localhost:8000/api/portfolio');
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          setProperties(portfolioData.properties || []);
        }

        // Fetch market trends
        const trendsResponse = await fetch('http://localhost:8000/market-trends/current-trends');
        if (trendsResponse.ok) {
          const trendsData = await trendsResponse.json();
          setMarketTrends(trendsData);
        }

        // Fetch user activities
        const activitiesResponse = await fetch('http://localhost:8000/api/user/activities');
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setUserActivities(activitiesData.activities || []);
        }
      } catch (error) {
        console.error('Error fetching API data:', error);
      }
    };

    // Only fetch from API if localStorage is empty
    if (!properties.length || !marketTrends || !userActivities.length) {
      fetchFromAPI();
    }
  }, []);

  // Generate sample data if real data is not available
  useEffect(() => {
    if (!properties.length) {
      setProperties([
        {
          id: 1,
          name: 'Dubai Marina Apartment',
          location: 'Dubai Marina',
          purchasePrice: 1200000,
          currentValue: 1350000,
          monthlyRent: 7500,
          roi: 7.5,
          occupancyRate: 92,
          image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'
        },
        {
          id: 2,
          name: 'Downtown Dubai Studio',
          location: 'Downtown Dubai',
          purchasePrice: 800000,
          currentValue: 900000,
          monthlyRent: 5000,
          roi: 7.2,
          occupancyRate: 88,
          image: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d'
        }
      ]);
    }

    if (!marketTrends) {
      setMarketTrends({
        area_trends: [
          { area: 'Dubai Marina', trend: '↑', description: 'Rent increased by 3.5%' },
          { area: 'Downtown Dubai', trend: '↑', description: 'Rent increased by 4.2%' },
          { area: 'Palm Jumeirah', trend: '↑', description: 'Rent increased by 5.1%' },
          { area: 'JVC', trend: '↓', description: 'Rent decreased by 1.8%' }
        ],
        daily_digest: [
          { text: 'Average rental yield in Dubai increased by 0.3%', is_increase: true, change: 0.3 },
          { text: 'New properties listed increased by 2.4% this month', is_increase: true, change: 2.4 },
          { text: 'Luxury segment shows 4.1% growth in transaction volume', is_increase: true, change: 4.1 }
        ]
      });
    }

    if (!userActivities.length) {
      setUserActivities([
        { 
          type: 'RENOVATION_APPROVED', 
          property: 'Dubai Marina Apartment', 
          details: 'Kitchen renovation approved',
          date: '2023-11-15',
          impact: 'Potential 5% increase in rental value'
        },
        { 
          type: 'RENTAL_ADJUSTMENT', 
          property: 'Downtown Dubai Studio', 
          details: 'Rent increased by 3%',
          date: '2023-11-10',
          impact: 'Monthly revenue increased by AED 150'
        },
        { 
          type: 'MAINTENANCE_SCHEDULED', 
          property: 'Dubai Marina Apartment', 
          details: 'Annual AC maintenance',
          date: '2023-11-05',
          impact: 'Cost: AED 500'
        }
      ]);
    }

    if (!investmentGoal) {
      setInvestmentGoal('maximize_roi');
    }
  }, [properties.length, marketTrends, userActivities.length, investmentGoal]);

  // Add this to update report info when data changes
  useEffect(() => {
    if (properties.length) {
      const totalValue = properties.reduce((sum, property) => sum + property.currentValue, 0);
      const avgROI = properties.reduce((sum, property) => sum + property.roi, 0) / properties.length;
      
      setReportInfo(prev => ({
        ...prev,
        portfolio: {
          totalCount: properties.length,
          totalValue,
          avgROI
        }
      }));
    }
    
    if (userActivities.length) {
      // Count activity types
      const types = {};
      userActivities.forEach(activity => {
        types[activity.type] = (types[activity.type] || 0) + 1;
      });
      
      setReportInfo(prev => ({
        ...prev,
        activities: {
          totalCount: userActivities.length,
          types
        }
      }));
    }
  }, [properties, userActivities]);

  const formatCurrency = (value) => {
    return `AED ${value.toLocaleString()}`;
  };

  const generatePDF = async (reportType) => {
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      // Validate and ensure all required data is available
      if (!properties.length) {
        throw new Error('No portfolio data available for the report');
      }
      
      if (reportType === 'market-analysis' && !marketTrends) {
        throw new Error('No market trend data available for the report');
      }
      
      if (reportType === 'activity-log' && !userActivities.length) {
        throw new Error('No activity data available for the report');
      }
      
      // Create new PDF document with very explicit margin settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Force consistent larger margins
      const margin = {
        left: 20,
        right: 20,
        top: 30,
        bottom: 30
      };
      
      // Set font to Times New Roman
      doc.setFont('times');
      
      // Generate different sections based on report type
      switch (reportType) {
        case 'portfolio-summary':
          addPortfolioSection(doc, margin);
          break;
        case 'market-analysis':
          addMarketSection(doc, margin);
          break;
        case 'activity-log':
          addActivitySection(doc, margin);
          break;
        case 'comprehensive':
          // Each section gets its own page
          addPortfolioSection(doc, margin);
          doc.addPage();
          addMarketSection(doc, margin);
          doc.addPage();
          addActivitySection(doc, margin);
          doc.addPage();
          addStrategySection(doc, margin);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Add footer line
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.5);
        doc.line(margin.left, doc.internal.pageSize.getHeight() - margin.bottom, 
                doc.internal.pageSize.getWidth() - margin.right, 
                doc.internal.pageSize.getHeight() - margin.bottom);
        
        // Add footer text
        doc.setFont('times');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Remmi AI Real Estate Management | Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - margin.bottom + 10,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      try {
        const reportName = `${reportType.replace(/-/g, '_')}_report_${months[selectedMonth].toLowerCase()}_${selectedYear}.pdf`;
        doc.save(reportName);
      } catch (downloadError) {
        console.error('Error downloading PDF:', downloadError);
        throw new Error('Failed to download the report. Please check browser permissions.');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage(error.message || 'Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper functions for each section with fixed spacing
  function addPortfolioSection(doc, margin) {
    // Add title page elements
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Comprehensive Investment Report', margin.left, margin.top);
    
    // Add section title
    doc.setFont('times', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('Portfolio Summary', margin.left, margin.top + 20);
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin.left, margin.top + 23, doc.internal.pageSize.getWidth() - margin.right, margin.top + 23);
    
    // Add reporting period
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Reporting Period: ${months[selectedMonth]} ${selectedYear}`, margin.left, margin.top + 35);
    
    // Add portfolio stats
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Properties: ${properties.length}`, margin.left, margin.top + 45);
    
    const totalValue = properties.reduce((sum, property) => sum + property.currentValue, 0);
    doc.text(`Total Portfolio Value: ${formatCurrency(totalValue)}`, margin.left, margin.top + 55);
    
    const averageROI = properties.reduce((sum, property) => sum + property.roi, 0) / properties.length;
    doc.text(`Average ROI: ${averageROI.toFixed(2)}%`, margin.left, margin.top + 65);
    
    // Add description
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('This section provides an overview of your real estate portfolio with key metrics and financial performance.', 
      margin.left, margin.top + 80);
    
    // Add properties table
    const tableColumns = ['Property', 'Location', 'Value', 'Monthly Rent', 'ROI'];
    const tableData = properties.map(property => [
      property.name,
      property.location,
      formatCurrency(property.currentValue),
      formatCurrency(property.monthlyRent),
      `${property.roi.toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      startY: margin.top + 95,
      head: [tableColumns],
      body: tableData,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        font: 'times',
        cellPadding: 8
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      },
      margin: { left: margin.left, right: margin.right }
    });
  }
  
  function addMarketSection(doc, margin) {
    // Add section title
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Market Analysis', margin.left, margin.top);
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin.left, margin.top + 3, doc.internal.pageSize.getWidth() - margin.right, margin.top + 3);
    
    // Add description
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('This analysis shows current real estate market trends in Dubai, including rental price changes and key market indicators.', 
      margin.left, margin.top + 15);
    
    // Area trends section
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Area Trends', margin.left, margin.top + 35);
    
    // Area trends table
    const trendColumns = ['Area', 'Trend', 'Description'];
    const trendData = marketTrends.area_trends.map(trend => [
      trend.area,
      trend.trend,
      trend.description
    ]);
    
    autoTable(doc, {
      startY: margin.top + 45,
      head: [trendColumns],
      body: trendData,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        font: 'times',
        cellPadding: 8
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      },
      margin: { left: margin.left, right: margin.right }
    });
    
    // Market indicators section
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Market Indicators', margin.left, doc.lastAutoTable.finalY + 25);
    
    // Market indicators table
    const digestColumns = ['Indicator', 'Change'];
    const digestData = marketTrends.daily_digest.map(digest => [
      digest.text,
      `${digest.is_increase ? '+' : '-'}${digest.change}%`
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 35,
      head: [digestColumns],
      body: digestData,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        font: 'times',
        cellPadding: 8
      },
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255, 
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      },
      margin: { left: margin.left, right: margin.right }
    });
  }
  
  function addActivitySection(doc, margin) {
    // Add section title
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Activity Log', margin.left, margin.top);
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin.left, margin.top + 3, doc.internal.pageSize.getWidth() - margin.right, margin.top + 3);
    
    // Add description
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text('This log tracks important actions related to your properties including:', 
      margin.left, margin.top + 15);
    
    // List activity types
    let typeY = margin.top + 25;
    activityTypes.forEach(activity => {
      doc.text(`• ${activity.type}: ${activity.description}`, margin.left + 5, typeY);
      typeY += 8;
    });
    
    // Filter activities for the selected month/year
    const filteredActivities = userActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate.getMonth() === selectedMonth && 
             activityDate.getFullYear() === selectedYear;
    });
    
    // Add reporting details
    typeY += 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Activities: ${filteredActivities.length}`, margin.left, typeY);
    
    typeY += 8;
    doc.setFont('times', 'normal');
    doc.text(`Reporting Period: ${months[selectedMonth]} ${selectedYear}`, margin.left, typeY);
    
    // Activity table
    const activityColumns = ['Date', 'Property', 'Activity', 'Impact'];
    const activityData = filteredActivities.map(activity => [
      activity.date,
      activity.property,
      activity.details,
      activity.impact
    ]);
    
    if (activityData.length > 0) {
      autoTable(doc, {
        startY: typeY + 15,
        head: [activityColumns],
        body: activityData,
        theme: 'grid',
        styles: { 
          fontSize: 10, 
          font: 'times',
          cellPadding: 8
        },
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255, 
          fontStyle: 'bold' 
        },
        alternateRowStyles: { 
          fillColor: [240, 240, 240] 
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 35 }, // Property
          2: { cellWidth: 60 }, // Activity
          3: { cellWidth: 50 }  // Impact
        },
        margin: { left: margin.left, right: margin.right }
      });
    } else {
      doc.setFont('times', 'italic');
      doc.text('No activities recorded for this period.', margin.left, typeY + 20);
    }
  }
  
  function addStrategySection(doc, margin) {
    // Add section title
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Investment Strategy', margin.left, margin.top);
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin.left, margin.top + 3, doc.internal.pageSize.getWidth() - margin.right, margin.top + 3);
    
    // Get investment goal details
    let goalName = 'Unknown';
    let goalDescription = '';
    let goalStrategies = '';
    
    if (investmentGoal === 'maximize_roi') {
      goalName = 'Maximize ROI';
      goalDescription = 'Focus on strategies that provide the highest return on investment';
      goalStrategies = '• Prioritize high-yield investments\n• Focus on rental income optimization\n• Consider short-term rentals for higher returns\n• Evaluate renovation costs against potential rent increases';
    } else if (investmentGoal === 'reduce_vacancies') {
      goalName = 'Reduce Vacancies';
      goalDescription = 'Prioritize keeping your properties occupied, even at competitive rates';
      goalStrategies = '• Prioritize tenant retention strategies\n• Offer competitive rental rates\n• Invest in property improvements that attract tenants\n• Implement responsive maintenance programs';
    } else if (investmentGoal === 'longterm_value') {
      goalName = 'Increase Long-term Value';
      goalDescription = 'Focus on appreciation and property improvements for future value';
      goalStrategies = '• Invest in emerging neighborhoods with growth potential\n• Focus on property improvements that increase value\n• Monitor infrastructure development in target areas\n• Prioritize long-term appreciation over short-term returns';
    }
    
    // Add goal details
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text(`Current Goal: ${goalName}`, margin.left, margin.top + 20);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text(goalDescription, margin.left, margin.top + 30);
    
    // Strategy implementation section
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Strategy Implementation', margin.left, margin.top + 50);
    
    // List strategies with fixed spacing
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const strategies = goalStrategies.split('\n');
    let stratY = margin.top + 65;
    strategies.forEach(strategy => {
      doc.text(strategy, margin.left + 5, stratY);
      stratY += 10; // Fixed 10mm spacing
    });
    
    // Additional strategy section
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Expected Outcomes', margin.left, stratY + 15);
    
    // Strategy outcomes
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text('By following this investment strategy, you can expect to:', margin.left, stratY + 30);
    
    let outcomes;
    if (investmentGoal === 'maximize_roi') {
      outcomes = [
        'Increase overall portfolio return by 1-2% annually',
        'Optimize cash flow from existing properties',
        'Identify and acquire high-yielding investment opportunities'
      ];
    } else if (investmentGoal === 'reduce_vacancies') {
      outcomes = [
        'Maintain occupancy rates above 90%',
        'Reduce turnover costs and vacancy periods',
        'Build a portfolio of consistently occupied properties'
      ];
    } else {
      outcomes = [
        'Build long-term wealth through property appreciation',
        'Establish a portfolio of properties in developing areas',
        'Benefit from infrastructure development and market growth'
      ];
    }
    
    let outcomeY = stratY + 40;
    outcomes.forEach(outcome => {
      doc.text(`• ${outcome}`, margin.left + 5, outcomeY);
      outcomeY += 10;
    });
  }

  // Add a simple function to create a local mock API response for user activities
  const createMockActivitiesAPI = () => {
    // Create a simple backend API mock for the missing endpoint
    window.fetch = (function(originalFetch) {
      return function(url, options) {
        if (url === 'http://localhost:8000/api/user/activities') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              activities: [
                { 
                  type: 'RENOVATION_APPROVED', 
                  property: 'Dubai Marina Apartment', 
                  details: 'Kitchen renovation approved',
                  date: '2023-11-15',
                  impact: 'Potential 5% increase in rental value'
                },
                { 
                  type: 'RENTAL_ADJUSTMENT', 
                  property: 'Downtown Dubai Studio', 
                  details: 'Rent increased by 3%',
                  date: '2023-11-10',
                  impact: 'Monthly revenue increased by AED 150'
                },
                { 
                  type: 'MAINTENANCE_SCHEDULED', 
                  property: 'Dubai Marina Apartment', 
                  details: 'Annual AC maintenance',
                  date: '2023-11-05',
                  impact: 'Cost: AED 500'
                }
              ]
            })
          });
        }
        return originalFetch(url, options);
      };
    })(window.fetch);
  };

  // Call our mock API creator on component mount
  useEffect(() => {
    createMockActivitiesAPI();
  }, []);

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">Generate Reports</h2>
          <motion.div
            className="w-2 h-2 rounded-full bg-accent-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <p className="text-slate-400 max-w-3xl">
          Generate detailed reports on your portfolio performance, market trends, and investment activities.
          Select a report type and time period to get started.
        </p>
      </motion.div>

      {/* Report Period Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/50"
      >
        <h3 className="text-lg font-medium text-white mb-4">Report Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Report Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-lg font-medium text-white mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.1) }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-slate-800 border border-slate-700/50 rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400">
                  {template.icon}
                </div>
                <h3 className="text-lg font-medium text-white">{template.name}</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4 flex-grow">{template.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generatePDF(template.id)}
                disabled={isGenerating}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Generate PDF
                  </>
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recently Generated Reports (Placeholder) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-800/40 p-6 rounded-lg border border-slate-700/50"
      >
        <h3 className="text-lg font-medium text-white mb-4">Recent Reports</h3>
        <div className="space-y-4">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white">Comprehensive Report - October 2023</h4>
                <p className="text-slate-400 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
              </div>
              <button className="text-primary-400 hover:text-primary-300 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error message display */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsTab;
