// קורא קובץ .docx בדפדפן ומחזיר טקסט רגיל, ללא תלות חיצונית.
// docx הוא ארכיון ZIP; אנו מאתרים את word/document.xml, מבצעים אינפלציה
// בעזרת DecompressionStream המובנה, וממירים את ה-XML לשורות טקסט.

async function inflateRaw(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

function xmlToText(xml) {
  const out = [];
  // כל <w:p> הוא פסקה/שורה
  const paras = xml.split(/<w:p[ >]/);
  for (const p of paras) {
    const texts = [...p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1]);
    let line = texts.join('');
    line = line
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (line.trim() !== '') out.push(line);
  }
  return out.join('\n');
}

export async function readDocx(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const dv = new DataView(data.buffer);
  let off = 0;
  while (off + 4 <= data.length && dv.getUint32(off, true) === 0x04034b50) {
    const method = dv.getUint16(off + 8, true);
    const compSize = dv.getUint32(off + 18, true);
    const nameLen = dv.getUint16(off + 26, true);
    const extraLen = dv.getUint16(off + 28, true);
    const name = new TextDecoder().decode(data.slice(off + 30, off + 30 + nameLen));
    const start = off + 30 + nameLen + extraLen;
    const comp = data.slice(start, start + compSize);
    if (name === 'word/document.xml') {
      const raw = method === 8 ? await inflateRaw(comp) : comp;
      const xml = new TextDecoder('utf-8').decode(raw);
      return xmlToText(xml);
    }
    off = start + compSize;
  }
  throw new Error('document.xml not found');
}
