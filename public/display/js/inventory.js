const itemsList = document.getElementById('itemsList');

document.getElementById('addItemForm').addEventListener('submit', (e) => {
	e.preventDefault();

	fetch('/inventory', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			item: e.target.item.value,
			category: e.target.category.value,
			measurement: e.target.quantity.value,
			measurementType: e.target.measurementType.value,
		}),
	}).then((res) => res.json());

	getAllItems();
	location.reload();
});

function updateItem(id) {
	document
		.getElementById('updateForm')
		.addEventListener('submit', async (e) => {
			e.preventDefault();

			await fetch(`/inventory/${id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					measurement: e.target.quantity.value,
					measurementType: e.target.measurementType.value,
				}),
			}).then((res) => res.json());

			getAllItems();
			location.reload();
		});
}

document.getElementById('searchBar').addEventListener('input', (e) => {
	e.preventDefault();
	let searched = e.target.value;
	fetch('/inventory/search', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			search: searched,
		}),
	})
		.then((res) => res.json())
		.then((data) => {
			itemsList.innerHTML = renderItems(data);
		});
});

async function getAllItems() {
	await fetch('/inventory')
		.then((res) => res.json())
		.then((data) => {
			itemsList.innerHTML = renderItems(data);
			initModals();
		});
}
getAllItems();

function deleteItem(id) {
	fetch(`/inventory/${id}`, {
		method: 'DELETE',
	})
		.then((res) => res.json())
		.then((data) => {
			getAllItems();
		});
}

function deleteAllItems() {
	fetch('/inventoryAll', {
		method: 'DELETE',
	})
		.then((res) => res.json())
		.then((data) => {
			document.getElementById('actionsDropdown').classList.add('hidden');
			getAllItems();
		});
}

function renderItems(items) {
	return items
		.map((item) => {
			return `
		<tr class="border-b dark:border-gray-700">
									<th
										scope="row"
										class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
									>
										${item.item}
									</th>
									<td class="px-4 py-3">${item.category}</td>
									<td class="px-4 py-3">${item.measurement}</td>
									<td class="px-4 py-3">${item.measurementType}</td>
									<td class="px-4 py-3 flex items-center justify-end">

										<div class="inline-flex rounded-md shadow-sm" role=group>
											<button data-modal-toggle="updateContainer" onclick="updateItem(${item.id})" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
												Edit
											</button>
											<button type="button" onclick="deleteItem(${item.id})" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
												Delete
											</button>
										</div>
									</td>
								</tr>`;
		})
		.join('');
}
