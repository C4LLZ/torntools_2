let initiatedPages = {};

(async () => {
	await showPage(getSearchParameters().get("page") || "targetList");

	await loadDatabase();

	document.body.classList.add(getPageTheme());
	storageListeners.settings.push(() => {
		document.body.classList.remove("dark", "light");
		document.body.classList.add(getPageTheme());
	});

	for (let navigation of document.findAll("header nav.on-page > ul > li")) {
		navigation.addEventListener("click", async () => {
			await showPage(navigation.getAttribute("to"));
		});
	}
})();

async function showPage(name) {
	window.history.replaceState("", "Title", "?page=" + name);

	for (let active of document.findAll("header nav.on-page > ul > li.active")) active.classList.remove("active");
	document.find(`header nav.on-page > ul > li[to="${name}"]`).classList.add("active");

	for (let active of document.findAll("body > main:not(.hidden)")) active.classList.add("hidden");
	document.find(`#${name}`).classList.remove("hidden");

	let setup = {
		targetList: setupTargetList,
		stakeouts: setupStakeouts,
	};

	if (!(name in initiatedPages) || !initiatedPages[name]) {
		await setup[name]();
		initiatedPages[name] = true;
	}
}

async function setupTargetList() {}

async function setupStakeouts() {
	const _preferences = document.find("#stakeouts");

	fillStakeouts();
	storageListeners.stakeouts.push(updateStakeouts);

	_preferences.find("#saveStakeouts").addEventListener("click", async () => await saveSettings());
	_preferences.find("#resetStakeouts").addEventListener("click", () => {
		loadConfirmationPopup({
			title: "Reset stakeouts",
			message: `<h3>Are you sure you want to delete all stakeouts?</h3>`,
		})
			.then(async () => {
				await ttStorage.set({ stakeouts: {} });
			})
			.catch((error) => console.error(error));
	});

	document.find("#addStakeout").addEventListener("click", async () => {
		const id = parseInt(document.find("#stakeoutId").value);

		document.find("#stakeoutId").value = "";
	});

	function fillStakeouts() {}

	function updateStakeouts() {}

	async function saveSettings() {
		const newStakeouts = {};

		await ttStorage.set({ stakeouts: newStakeouts });
		console.log("Stakeouts updated!", newStakeouts);
	}
}