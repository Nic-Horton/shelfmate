document.getElementById('login').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  const body = {
    email: email,
    password: password,
  };

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        window.location.href = './inventory/index.html';
      }
    });
});
