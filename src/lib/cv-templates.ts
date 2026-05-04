import type { CVFormData } from '@/types';

function formatDate(date: string): string {
  if (!date) return '';
  const d = date.trim();
  if (d.length === 7 && d.includes('-')) return d;
  if (d.length === 7 && d.includes('/')) {
    const [m, y] = d.split('/');
    return `${y}-${m.padStart(2, '0')}`;
  }
  return d;
}

function getLevelDots(level: string): string {
  const levels: Record<string, number> = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Native': 4 };
  const filled = levels[level] || 2;
  return Array(4).fill(0).map((_, i) => i < filled ? '●' : '○').join(' ');
}

export function modernTemplate(data: CVFormData): string {
  const { personalInfo, summary, experience, education, skills, languages, certifications } = data;

  const expHtml = experience.filter(e => e.company).map(e => `
    <div style="margin-bottom:16px; position:relative; padding-left:20px; border-left:3px solid #3B82F6; padding-bottom:8px;">
      <div style="position:absolute; left:-7px; top:4px; width:10px; height:10px; background:#3B82F6; border-radius:50%;"></div>
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <div>
          <div style="font-weight:600; color:#1E293B; font-size:14px;">${e.position}</div>
          <div style="color:#3B82F6; font-size:13px; font-weight:500;">${e.company}</div>
        </div>
        <div style="color:#64748B; font-size:12px; white-space:nowrap;">${formatDate(e.startDate)} - ${e.current ? 'Present' : formatDate(e.endDate)}</div>
      </div>
      ${e.description ? `<div style="color:#475569; font-size:12px; margin-top:6px; line-height:1.5;">${e.description}</div>` : ''}
    </div>
  `).join('');

  const eduHtml = education.filter(e => e.institution).map(e => `
    <div style="margin-bottom:14px;">
      <div style="font-weight:600; color:#1E293B; font-size:14px;">${e.institution}</div>
      <div style="color:#3B82F6; font-size:13px;">${e.degree}${e.field ? ` in ${e.field}` : ''}</div>
      <div style="color:#64748B; font-size:12px;">${formatDate(e.startDate)} - ${formatDate(e.endDate)}${e.grade ? ` | Grade: ${e.grade}` : ''}</div>
    </div>
  `).join('');

  const skillsHtml = skills.filter(s => s.category).map(s => `
    <div style="margin-bottom:12px;">
      <div style="font-size:11px; font-weight:600; color:#3B82F6; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">${s.category}</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${s.items.map(item => `<span style="background:#EFF6FF; color:#1D4ED8; padding:3px 10px; border-radius:12px; font-size:11px;">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const langHtml = languages.filter(l => l.name).map(l => `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="font-size:13px; color:#E2E8F0;">${l.name}</span>
      <span style="font-size:12px; color:#93C5FD;">${getLevelDots(l.level)}</span>
    </div>
  `).join('');

  const certHtml = certifications.filter(c => c.name).map(c => `
    <div style="margin-bottom:10px;">
      <div style="font-weight:500; color:#1E293B; font-size:13px;">${c.name}</div>
      <div style="color:#64748B; font-size:12px;">${c.issuer}${c.date ? ` | ${c.date}` : ''}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: white; color: #1E293B; font-size: 13px; line-height: 1.5; }
    @page { size: A4; margin: 0; }
    .page { width: 210mm; height: 297mm; display: flex; overflow: hidden; }
    .sidebar { width: 35%; background: #0F172A; color: #E2E8F0; padding: 30px 20px; display: flex; flex-direction: column; }
    .main { width: 65%; padding: 30px 25px; }
    .photo { width: 120px; height: 120px; border-radius: 50%; background: #334155; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: #94A3B8; font-size: 12px; border: 3px solid #3B82F6; }
    .name { font-size: 24px; font-weight: 700; color: white; text-align: center; margin-bottom: 4px; }
    .title { font-size: 13px; color: #93C5FD; text-align: center; margin-bottom: 20px; }
    .contact-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #CBD5E1; margin-bottom: 8px; }
    .sidebar-section { margin-top: 20px; }
    .sidebar-header { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #93C5FD; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #334155; }
    .section { margin-bottom: 20px; }
    .section-header { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #3B82F6; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 2px solid #3B82F6; }
    .summary { color: #475569; font-size: 12px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="page">
    <div class="sidebar">
      <div class="photo">${personalInfo.photo ? `<img src="${personalInfo.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : 'Photo'}</div>
      <div class="name">${personalInfo.fullName}</div>
      <div class="title">${experience[0]?.position || 'Professional'}</div>
      <div style="font-size:11px; color:#CBD5E1; display:flex; flex-direction:column; gap:6px; margin-top:15px;">
        ${personalInfo.email ? `<div class="contact-item">✉ ${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div class="contact-item">📍 ${personalInfo.phone}</div>` : ''}
        ${personalInfo.address ? `<div class="contact-item">📍 ${personalInfo.address}</div>` : ''}
        ${personalInfo.linkedin ? `<div class="contact-item">🔗 ${personalInfo.linkedin}</div>` : ''}
        ${personalInfo.website ? `<div class="contact-item">🌐 ${personalInfo.website}</div>` : ''}
      </div>
      ${skills.length ? `<div class="sidebar-section"><div class="sidebar-header">Skills</div>${skillsHtml}</div>` : ''}
      ${languages.length ? `<div class="sidebar-section"><div class="sidebar-header">Languages</div>${langHtml}</div>` : ''}
    </div>
    <div class="main">
      ${summary ? `<div class="section"><div class="section-header">Professional Summary</div><div class="summary">${summary}</div></div>` : ''}
      ${experience.filter(e => e.company).length ? `<div class="section"><div class="section-header">Work Experience</div>${expHtml}</div>` : ''}
      ${education.filter(e => e.institution).length ? `<div class="section"><div class="section-header">Education</div>${eduHtml}</div>` : ''}
      ${certifications.filter(c => c.name).length ? `<div class="section"><div class="section-header">Certifications</div>${certHtml}</div>` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function classicTemplate(data: CVFormData): string {
  const { personalInfo, summary, experience, education, skills, languages, certifications } = data;

  const expHtml = experience.filter(e => e.company).map(e => `
    <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:baseline;">
      <div>
        <div style="font-weight:700; font-size:15px; color:#1F2937;">${e.company}</div>
        <div style="font-style:italic; color:#4B5563; font-size:13px;">${e.position}</div>
        ${e.description ? `<div style="color:#6B7280; font-size:12px; margin-top:6px; line-height:1.6;">${e.description}</div>` : ''}
      </div>
      <div style="color:#6B7280; font-size:12px; white-space:nowrap; text-align:right;">${formatDate(e.startDate)} - ${e.current ? 'Present' : formatDate(e.endDate)}</div>
    </div>
  `).join('');

  const eduHtml = education.filter(e => e.institution).map(e => `
    <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:baseline;">
      <div>
        <div style="font-weight:700; font-size:14px; color:#1F2937;">${e.institution}</div>
        <div style="color:#4B5563; font-size:13px;">${e.degree}${e.field ? ` in ${e.field}` : ''}</div>
      </div>
      <div style="color:#6B7280; font-size:12px;">${formatDate(e.startDate)} - ${formatDate(e.endDate)}${e.grade ? ` | ${e.grade}` : ''}</div>
    </div>
  `).join('');

  const skillsHtml = skills.filter(s => s.category).map(s => `
    <div style="margin-bottom:14px; background:#F3F4F6; border-left:3px solid #1F2937; padding:10px 14px; border-radius:0 4px 4px 0;">
      <div style="font-size:12px; font-weight:700; color:#1F2937; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">${s.category}</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${s.items.map(item => `<span style="background:white; color:#374151; padding:3px 10px; border:1px solid #D1D5DB; border-radius:3px; font-size:11px;">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const langHtml = languages.filter(l => l.name).map(l => `
    <div style="display:inline-block; margin:4px 8px 4px 0; font-size:13px; color:#374151;">${l.name} <span style="color:#9CA3AF; font-size:12px;">(${l.level})</span></div>
  `).join('');

  const certHtml = certifications.filter(c => c.name).map(c => `
    <div style="margin-bottom:10px;">
      <div style="font-weight:600; font-size:13px; color:#1F2937;">${c.name}</div>
      <div style="color:#6B7280; font-size:12px;">${c.issuer}${c.date ? ` | ${c.date}` : ''}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Lora', serif; background: white; color: #1F2937; font-size: 13px; line-height: 1.6; }
    @page { size: A4; margin: 0; }
    .page { width: 210mm; height: 297mm; padding: 40px 50px; }
    .name { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; text-align: center; color: #111827; }
    .title { font-family: 'Playfair Display', serif; font-size: 16px; text-align: center; color: #6B7280; margin-bottom: 8px; }
    .contact { text-align: center; font-size: 11px; color: #6B7280; margin-bottom: 20px; }
    .photo { width: 100px; height: 100px; border-radius: 50%; background: #E5E7EB; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-size: 11px; }
    hr { border: none; border-top: 1px solid #E5E7EB; margin: 18px 0; }
    .section-header { font-family: 'Playfair Display', serif; font-size: 20px; text-transform: uppercase; text-align: center; color: #111827; margin-bottom: 4px; }
    .section-header-line { border: none; border-top: 1px solid #E5E7EB; margin-bottom: 14px; }
    .summary { color: #374151; font-size: 12px; line-height: 1.7; text-align: justify; }
    .alt-section { background: #F8F8F8; margin: 0 -50px; padding: 14px 50px; }
  </style>
</head>
<body>
  <div class="page">
    <div style="text-align:center;">
      <div class="photo">${personalInfo.photo ? `<img src="${personalInfo.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : ''}</div>
      <div class="name">${personalInfo.fullName}</div>
      <div style="font-family:'Playfair Display',serif; font-size:16px; text-align:center; color:#6B7280; margin-bottom:8px;">${experience[0]?.position || 'Professional'}</div>
      <div class="contact">
        ${personalInfo.email ? `✉ ${personalInfo.email}` : ''}${personalInfo.email && personalInfo.phone ? ' • ' : ''}${personalInfo.phone ? `📍 ${personalInfo.phone}` : ''}${personalInfo.address ? ` • 📍 ${personalInfo.address}` : ''}${personalInfo.linkedin ? ` • 🔗 ${personalInfo.linkedin}` : ''}
      </div>
    </div>
    <hr>
    ${summary ? `<div class="section"><div class="section-header">Professional Summary</div><hr class="section-header-line"><div class="summary">${summary}</div></div><hr>` : ''}
    ${experience.filter(e => e.company).length ? `<div class="section"><div class="section-header">Work Experience</div><hr class="section-header-line">${expHtml}</div><hr>` : ''}
    ${education.filter(e => e.institution).length ? `<div class="alt-section"><div class="section-header">Education</div><hr class="section-header-line">${eduHtml}</div><hr>` : ''}
    ${skills.length ? `<div class="section"><div class="section-header">Skills</div><hr class="section-header-line">${skillsHtml}</div><hr>` : ''}
    ${languages.length ? `<div class="section"><div class="section-header">Languages</div><hr class="section-header-line"><div style="display:flex; flex-wrap:wrap; gap:4px;">${langHtml}</div></div><hr>` : ''}
    ${certifications.filter(c => c.name).length ? `<div class="section"><div class="section-header">Certifications</div><hr class="section-header-line">${certHtml}</div>` : ''}
  </div>
</body>
</html>`;
}

export function creativeTemplate(data: CVFormData): string {
  const { personalInfo, summary, experience, education, skills, languages, certifications } = data;

  const expHtml = experience.filter(e => e.company).map(e => `
    <div style="margin-bottom:16px; padding:14px; background:white; border-left:4px solid #7C3AED; border-radius:0 6px 6px 0; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <div>
          <div style="font-weight:600; color:#1F2937; font-size:14px;">${e.position}</div>
          <div style="color:#7C3AED; font-size:13px; font-weight:500;">${e.company}</div>
        </div>
        <div style="color:#6B7280; font-size:12px;">${formatDate(e.startDate)} - ${e.current ? 'Present' : formatDate(e.endDate)}</div>
      </div>
      ${e.description ? `<div style="color:#4B5563; font-size:12px; margin-top:8px; line-height:1.5;">${e.description}</div>` : ''}
    </div>
  `).join('');

  const eduHtml = education.filter(e => e.institution).map(e => `
    <div style="margin-bottom:14px; padding:12px; background:#F5F3FF; border-radius:6px;">
      <div style="font-weight:600; color:#1F2937; font-size:14px;">${e.institution}</div>
      <div style="color:#7C3AED; font-size:13px;">${e.degree}${e.field ? ` in ${e.field}` : ''}</div>
      <div style="color:#6B7280; font-size:12px; margin-top:4px;">${formatDate(e.startDate)} - ${formatDate(e.endDate)}${e.grade ? ` | Grade: ${e.grade}` : ''}</div>
    </div>
  `).join('');

  const skillsHtml = skills.filter(s => s.category).map(s => `
    <div style="margin-bottom:12px;">
      <div style="font-size:12px; font-weight:600; color:#7C3AED; margin-bottom:8px;">📊 ${s.category}</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${s.items.map(item => `<span style="background:#A78BFA; color:white; padding:4px 12px; border-radius:12px; font-size:11px;">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');

  const langHtml = languages.filter(l => l.name).map(l => `
    <span style="display:inline-block; background:#EDE9FE; color:#5B21B; padding:4px 12px; border-radius:12px; font-size:11px; margin:3px;">${l.name} (${l.level})</span>
  `).join('');

  const certHtml = certifications.filter(c => c.name).map(c => `
    <div style="display:inline-block; background:#FEF3C7; color:#92400E; padding:5px 12px; border-radius:12px; font-size:11px; margin:3px;">🏆 ${c.name}</div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Poppins', sans-serif; background: white; color: #1F2937; font-size: 13px; line-height: 1.5; }
    @page { size: A4; margin: 0; }
    .page { width: 210mm; height: 297mm; display: flex; overflow: hidden; }
    .sidebar { width: 40%; background: linear-gradient(180deg, #7C3AED 0%, #4F46E5 100%); color: white; padding: 30px 20px; display: flex; flex-direction: column; }
    .main { width: 60%; padding: 30px 25px; overflow-y: auto; }
    .photo { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; font-size: 11px; border: 3px solid white; }
    .name { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 4px; }
    .title { font-size: 13px; opacity: 0.9; text-align: center; margin-bottom: 20px; }
    .contact-item { display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 8px; }
    .sidebar-section { margin-top: 20px; }
    .sidebar-header { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.3); }
    .section { margin-bottom: 22px; }
    .section-header { font-size: 16px; font-weight: 600; color: #7C3AED; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .summary { color: #4B5563; font-size: 12px; line-height: 1.6; }
    .main { color: #1F2937; }
  </style>
</head>
<body>
  <div class="page">
    <div class="sidebar">
      <div class="photo">${personalInfo.photo ? `<img src="${personalInfo.photo}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">` : 'Photo'}</div>
      <div class="name">${personalInfo.fullName}</div>
      <div class="title">${experience[0]?.position || 'Professional'}</div>
      <div style="font-size:11px; display:flex; flex-direction:column; gap:6px; margin-top:15px;">
        ${personalInfo.email ? `<div class="contact-item">✉ ${personalInfo.email}</div>` : ''}
        ${personalInfo.phone ? `<div class="contact-item">📱 ${personalInfo.phone}</div>` : ''}
        ${personalInfo.address ? `<div class="contact-item">📍 ${personalInfo.address}</div>` : ''}
        ${personalInfo.linkedin ? `<div class="contact-item">🔗 ${personalInfo.linkedin}</div>` : ''}
      </div>
      ${skills.length ? `<div class="sidebar-section"><div class="sidebar-header">💡 Skills</div>${skillsHtml}</div>` : ''}
      ${languages.length ? `<div class="sidebar-section"><div class="sidebar-header">🌐 Languages</div><div style="display:flex; flex-wrap:wrap; gap:6px;">${langHtml}</div></div>` : ''}
    </div>
    <div class="main">
      ${summary ? `<div class="section"><div class="section-header">🚀 Professional Summary</div><div class="summary">${summary}</div></div>` : ''}
      ${experience.filter(e => e.company).length ? `<div class="section"><div class="section-header">💼 Work Experience</div>${expHtml}</div>` : ''}
      ${education.filter(e => e.institution).length ? `<div class="section"><div class="section-header">🎓 Education</div>${eduHtml}</div>` : ''}
      ${certifications.filter(c => c.name).length ? `<div class="section"><div class="section-header">🏆 Certifications</div><div style="display:flex; flex-wrap:wrap; gap:6px;">${certHtml}</div></div>` : ''}
    </div>
  </div>
</body>
</html>`;
}
