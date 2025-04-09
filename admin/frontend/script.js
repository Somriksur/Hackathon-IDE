document.getElementById('questionForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page from refreshing
  
    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      input: document.getElementById('input').value,
      output: document.getElementById('output').value
    };
  
    // Send data to backend API
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  
    const result = await res.json();
  
    if (res.ok) {
      const link = `${window.location.origin}/question/${result.id}`;
      document.getElementById('result').innerHTML = `<a href="${link}">${link}</a>`;
    }
  });
  