document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('registerForm').addEventListener('submit', (e) => {
		e.preventDefault();

		fetch('/register', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				firstName: e.target.first_name.value,
				lastName: e.target.last_name.value,
				email: e.target.email.value,
				password: e.target.password.value,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					return alert('Email in use. Please try another email');
				} else if (data) {
					alert('Account created please sign in');
					window.location.href = './index.html';
				}
			});
	});
});
