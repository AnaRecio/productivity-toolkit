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
        const page = pdfDoc.addPage([612, 792]); // US Letter size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let y = 770;
        const left = 50;
        const lineHeight = 18;

        // Helper to draw text and move y
        function drawText(text, opts = {}) {
            page.drawText(text, { x: left, y, size: opts.size || 12, font, ...opts });
            y -= opts.lineHeight || lineHeight;
        }

        // Title
        drawText('Ultimate Productivity & Wellness Toolkit', { size: 18, color: rgb(0.29, 0.56, 0.89), lineHeight: 28 });

        // Date
        drawText('Date: ' + document.getElementById('current-date').value);

        // Morning Intention
        drawText('Morning Intention: ' + document.getElementById('morning-intention').value);

        // Mood Tracker
        const mood = document.querySelector('.mood-option.selected');
        drawText('Mood: ' + (mood ? mood.textContent : ''));

        // Top 3 Goals
        drawText('Top 3 Goals:');
        document.querySelectorAll('.goal-input').forEach((goal, i) => {
            drawText(`${i + 1}. ${goal.value}`, { left: left + 20, size: 11 });
        });

        // Time Block Schedule
        drawText('Time Block Schedule:');
        document.querySelectorAll('.time-block').forEach(block => {
            const time = block.querySelector('span').textContent;
            const task = block.querySelector('input').value;
            drawText(`${time} - ${task}`, { left: left + 20, size: 11 });
        });

        // Self-Care Reminders (static)
        drawText('Self-Care Reminders: 💧 Stay Hydrated | 🧘 Take Stretch Breaks | ☀️ Get Sunlight | 🎯 Focus on Priorities');

        // End-of-Day Reflection
        const reflection = document.querySelector('textarea[placeholder="What went well? What can you improve?"]').value;
        drawText('End-of-Day Reflection:');
        drawText(reflection, { left: left + 20, size: 11 });

        // Gratitude Journal
        drawText('Gratitude Journal:');
        document.querySelectorAll('.gratitude-input input').forEach((input, i) => {
            drawText(`${i + 1}. ${input.value}`, { left: left + 20, size: 11 });
        });

        // Digital Detox Challenge (list and progress)
        drawText('7-Day Digital Detox Challenge:');
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
            drawText(`Day ${i + 1}: ${desc}`, { left: left + 20, size: 11 });
        });
        // Progress bar (count checked checkboxes in detox section)
        const detoxProgress = document.querySelectorAll('.progress')[0].style.width;
        drawText(`Detox Progress: ${detoxProgress}`);

        // Goal Visualization
        drawText('Goal Visualization:');
        const mainGoal = document.querySelector('input[placeholder="What do you want to achieve?"]').value;
        drawText('Main Goal: ' + mainGoal, { left: left + 20, size: 11 });
        const whyMatters = document.querySelector('textarea[placeholder="What\'s your motivation?"]').value;
        drawText('Why it Matters: ' + whyMatters, { left: left + 20, size: 11 });
        const successVision = document.querySelector('textarea[placeholder="Describe your vision of success"]').value;
        drawText('What Success Looks Like: ' + successVision, { left: left + 20, size: 11 });
        drawText('First 3 Action Steps:', { left: left + 20, size: 11 });
        document.querySelectorAll('ol li input[placeholder^="Step"]').forEach((input, i) => {
            drawText(`${i + 1}. ${input.value}`, { left: left + 40, size: 11 });
        });

        // Weekly Wellness Habit Tracker
        drawText('Weekly Wellness Habit Tracker:');
        const habitRows = document.querySelectorAll('.checkboxes tr');
        for (let i = 1; i < habitRows.length; i++) { // skip header
            const cells = habitRows[i].querySelectorAll('td');
            const habit = cells[0].textContent;
            let days = '';
            for (let j = 1; j < cells.length; j++) {
                days += cells[j].querySelector('input').checked ? '✔️ ' : '❌ ';
            }
            drawText(`${habit}: ${days}`, { left: left + 20, size: 11 });
        }

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