document.getElementById('signout').addEventListener('click', (e) => {
	e.preventDefault();

	fetch('/logout', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then((data) => {
			window.location.href = '../index.html';
		});
});
