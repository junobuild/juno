/**
 * Auto-generated definitions file ("npm run i18n")
 */

interface I18nCore {
	close: string;
	back: string;
	menu: string;
	copy: string;
	toggle: string;
	loading: string;
	status: string;
	sign_out: string;
	sign_in: string;
	light_off: string;
	light_on: string;
	submit: string;
	home: string;
	help: string;
	controllers: string;
	rules: string;
}

interface I18nCanisters {
	top_up: string;
	cycles: string;
}

interface I18nSign_in {
	title: string;
	overview_1: string;
	overview_2: string;
	overview_3: string;
	internet_identity: string;
}

interface I18nSatellites {
	title: string;
	launch: string;
	open: string;
	create: string;
	satellite: string;
}

interface I18nMission_control {
	title: string;
	id: string;
	account_identifier: string;
	balance: string;
	credits: string;
	dev_id: string;
	transactions: string;
}

interface I18nOverview {
	title: string;
}

interface I18nAuthentication {
	title: string;
	users: string;
	methods: string;
}

interface I18nDatastore {
	title: string;
	data: string;
}

interface I18nStorage {
	title: string;
}

interface I18nHosting {
	title: string;
}

interface I18nCli {
	title: string;
	sign_in: string;
	add: string;
}

interface I18nErrors {
	no_mission_control: string;
	cli_missing_params: string;
	cli_missing_selection: string;
	cli_unexpected_error: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	canisters: I18nCanisters;
	sign_in: I18nSign_in;
	satellites: I18nSatellites;
	mission_control: I18nMission_control;
	overview: I18nOverview;
	authentication: I18nAuthentication;
	datastore: I18nDatastore;
	storage: I18nStorage;
	hosting: I18nHosting;
	cli: I18nCli;
	errors: I18nErrors;
}
