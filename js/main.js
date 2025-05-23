// Initialize date
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-date').value = new Date().toLocaleDateString();
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Checkbox event listeners
    document.querySelectorAll('.checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateDetoxProgress);
    });

    // Mood tracker event listeners
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', handleMoodSelection);
    });
}

// Update detox progress
function updateDetoxProgress() {
    const checkboxes = document.querySelectorAll('.checkbox');
    const checked = document.querySelectorAll('.checkbox:checked').length;
    const total = checkboxes.length;
    const progress = (checked / total) * 100;
    document.getElementById('detox-progress').style.width = `${progress}%`;
}

// Handle mood selection
function handleMoodSelection() {
    document.querySelectorAll('.mood-option').forEach(opt => opt.classList.remove('selected'));
    this.classList.add('selected');
}

// Clear form function
function clearForm() {
    if (confirm('Are you sure you want to clear all inputs?')) {
        document.querySelectorAll('input[type="text"], textarea').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
        });
        updateDetoxProgress();
    }
}

// Generate PDF function using PDF-Lib
async function generatePDF() {
    try {
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([612, 792]); // US Letter size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let y = 770;
        const left = 50;
        const right = 560;
        const lineHeight = 18;
        const bottomMargin = 60;

        // Helper to check if we need a new page
        function ensureSpace(lines = 1, extra = 0) {
            if (y - (lines * lineHeight + extra) < bottomMargin) {
                page = pdfDoc.addPage([612, 792]);
                y = 770;
            }
        }
        // Helper to draw text and move y
        function drawText(text, opts = {}) {
            ensureSpace(1, opts.lineHeight || lineHeight);
            page.drawText(text, { x: opts.left || left, y, size: opts.size || 12, font, ...opts });
            y -= opts.lineHeight || lineHeight;
        }
        // Helper to draw section headers
        function drawHeader(text) {
            ensureSpace(1, 24);
            drawText(text, { size: 15, color: rgb(0.2, 0.2, 0.6), lineHeight: 24 });
        }
        // Helper to draw divider (only between sections)
        function drawDivider() {
            ensureSpace(0, 14);
            y -= 4;
            page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
            y -= 10;
        }

        // Title
        drawText('Ultimate Productivity & Wellness Toolkit', { size: 18, color: rgb(0.29, 0.56, 0.89), lineHeight: 28 });

        // Date
        drawHeader('Daily Focus Planner');
        drawText('Date: ' + document.getElementById('current-date').value);
        drawText('Morning Intention: ' + document.getElementById('morning-intention').value);
        const mood = document.querySelector('.mood-option.selected');
        drawText('Mood: ' + (mood ? mood.textContent : ''));
        drawText('');
        drawDivider();

        // Top 3 Goals
        drawHeader('Top 3 Goals:');
        document.querySelectorAll('.goal-input').forEach((goal, i) => {
            drawText(`${i + 1}. ${goal.value}`, { left: left + 20, size: 12 });
        });
        drawText('');
        drawDivider();

        // Time Block Schedule
        drawHeader('Time Block Schedule:');
        document.querySelectorAll('.time-block').forEach(block => {
            const time = block.querySelector('span').textContent;
            const task = block.querySelector('input').value;
            drawText(`${time} - ${task}`, { left: left + 20, size: 12 });
        });
        drawText('');
        drawDivider();

        // Self-Care Reminders
        drawHeader('Self-Care Reminders:');
        drawText('Stay Hydrated | Take Stretch Breaks | Get Sunlight | Focus on Priorities', { left: left + 20, size: 12 });
        drawText('');
        drawDivider();

        // End-of-Day Reflection
        drawHeader('End-of-Day Reflection:');
        const reflection = document.querySelector('textarea[placeholder="What went well? What can you improve?"]').value;
        drawText(reflection, { left: left + 20, size: 12 });
        drawDivider();

        // Gratitude Journal
        drawHeader('Gratitude Journal:');
        document.querySelectorAll('.gratitude-input input').forEach((input, i) => {
            drawText(`${i + 1}. ${input.value}`, { left: left + 20, size: 12 });
        });
        drawDivider();

        // Digital Detox Challenge
        drawHeader('7-Day Digital Detox Challenge:');
        const detoxDays = [
            'No phone for first hour after waking up',
            'Delete 1 distracting app',
            'One-hour screen-free break',
            'Social media time limit',
            'No phone 1 hour before bed',
            'Turn off notifications',
            'Log off 1 hour during the day'
        ];
        detoxDays.forEach((desc, i) => {
            drawText(`Day ${i + 1}: ${desc}`, { left: left + 20, size: 12 });
        });
        const detoxProgress = document.querySelectorAll('.progress')[0].style.width;
        drawText(`Detox Progress: ${detoxProgress}`);
        drawDivider();

        // Goal Visualization
        drawHeader('Goal Visualization:');
        const mainGoal = document.querySelector('input[placeholder="What do you want to achieve?"]').value;
        drawText('Main Goal: ' + mainGoal, { left: left + 20, size: 12 });
        const whyMatters = document.querySelector('textarea[placeholder="What\'s your motivation?"]').value;
        drawText('Why it Matters: ' + whyMatters, { left: left + 20, size: 12 });
        const successVision = document.querySelector('textarea[placeholder="Describe your vision of success"]').value;
        drawText('What Success Looks Like: ' + successVision, { left: left + 20, size: 12 });
        drawText('First 3 Action Steps:', { left: left + 20, size: 12 });
        // Numbered list for action steps
        const actionSteps = document.querySelectorAll('ol li input[placeholder^="Step"]');
        actionSteps.forEach((input, i) => {
            drawText(`${i + 1}. ${input.value}`, { left: left + 40, size: 12 });
        });
        drawDivider();

        // Daily Wellness Habit Tracker (today only)
        drawHeader('Daily Wellness Habit Tracker:');
        const habitRows = document.querySelectorAll('.checkboxes tr');
        // Get today's day index (Mon=1, Tue=2, ..., Sun=7)
        const today = new Date();
        let dayIdx = today.getDay(); // Sunday=0, Monday=1, ...
        if (dayIdx === 0) dayIdx = 7; // Make Sunday=7 for table
        for (let i = 1; i < habitRows.length; i++) { // skip header
            const cells = habitRows[i].querySelectorAll('td');
            const habit = cells[0].textContent;
            // Only check today's column
            const checked = cells[dayIdx]?.querySelector('input').checked ? 'Yes' : 'No';
            drawText(`${habit}: ${checked}`, { left: left + 20, size: 12 });
        }
        // No divider after last section

        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'productivity_toolkit.pdf';
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
} 