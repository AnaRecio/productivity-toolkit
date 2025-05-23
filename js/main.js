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
        let y = 750;

        // Add title
        page.drawText('Ultimate Productivity & Wellness Toolkit', {
            x: 50, y, size: 18, font, color: rgb(0.29, 0.56, 0.89)
        });

        // Add date
        y -= 40;
        page.drawText('Date: ' + document.getElementById('current-date').value, {
            x: 50, y, size: 12, font
        });

        // Add morning intention
        y -= 30;
        const morningIntention = document.getElementById('morning-intention').value;
        page.drawText('Morning Intention: ' + morningIntention, {
            x: 50, y, size: 12, font
        });

        // Add goals
        y -= 30;
        page.drawText('Top 3 Goals:', { x: 50, y, size: 12, font });
        document.querySelectorAll('.goal-input').forEach((goal, index) => {
            y -= 20;
            page.drawText(`${index + 1}. ${goal.value}`, { x: 70, y, size: 11, font });
        });

        // Add gratitude entries
        y -= 40;
        page.drawText('Gratitude Journal:', { x: 50, y, size: 12, font });
        document.querySelectorAll('.gratitude-input input').forEach((input, index) => {
            y -= 20;
            page.drawText(`${index + 1}. ${input.value}`, { x: 70, y, size: 11, font });
        });

        // Add digital detox progress
        y -= 40;
        page.drawText('Digital Detox Progress:', { x: 50, y, size: 12, font });
        const detoxProgress = document.getElementById('detox-progress').style.width;
        page.drawText(`Progress: ${detoxProgress}`, { x: 70, y: y - 20, size: 11, font });

        // Add wellness habits
        y -= 60;
        page.drawText('Weekly Wellness Habits:', { x: 50, y, size: 12, font });
        const habits = ['Hydration', 'Exercise', 'Meditation', 'Healthy Meals', 'Screen-Free Breaks'];
        habits.forEach((habit, index) => {
            y -= 20;
            const checked = document.querySelectorAll(`.checkboxes tr:nth-child(${index + 2}) .checkbox:checked`).length;
            page.drawText(`${habit}: ${checked}/7 days`, { x: 70, y, size: 11, font });
        });

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