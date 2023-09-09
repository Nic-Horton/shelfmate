const updateUserForm = document.getElementById('updateUserForm');

function getUserInfo() {
	fetch('/users/info')
		.then((res) => res.json())
		.then((data) => {
			document
				.getElementById('firstName')
				.setAttribute('placeholder', `${data.firstName}`);
			document
				.getElementById('lastName')
				.setAttribute('placeholder', `${data.lastName}`);
			document
				.getElementById('email')
				.setAttribute('placeholder', `${data.email}`);
		});
}
getUserInfo();

updateUserForm.addEventListener('submit', (e) => {
	e.preventDefault();
	fetch('/users/settings', {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			firstName: e.target.firstName.value,
			lastName: e.target.lastName.value,
		}),
	}).then((res) => res.json());
	getUserInfo();
	location.reload();
});
