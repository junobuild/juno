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
	settings: string;
	continue: string;
	not_logged_in: string;
	ready: string;
	yes: string;
	no: string;
	ok: string;
	cancel: string;
	apply: string;
	language: string;
	user_menu: string;
	version: string;
	delete: string;
	skip: string;
	done: string;
	from: string;
	to: string;
}

interface I18nCanisters {
	top_up: string;
	cycles: string;
	top_up_in_progress: string;
	upgrade_in_progress: string;
	download_in_progress: string;
	amount: string;
	top_up_title: string;
	upgrade_title: string;
	upgrade_description: string;
	more_upgrade: string;
	upgrade_note: string;
	additional_cycles: string;
	top_up_info: string;
	top_up_mission_control_done: string;
	top_up_satellite_done: string;
	daily_consumption: string;
	review_upgrade: string;
	confirm_upgrade: string;
	upgrade_done: string;
	upgrade: string;
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
	ready: string;
	initializing: string;
	start: string;
	description: string;
	name: string;
	satellite_name: string;
	enter_name: string;
	edit_name: string;
	create_satellite_price: string;
	loading_satellites: string;
	overview: string;
	id: string;
}

interface I18nMission_control {
	title: string;
	overview: string;
	id: string;
	account_identifier: string;
	balance: string;
	credits: string;
	transactions: string;
	transfer_icp_info: string;
	transfer_to_account_identifier: string;
}

interface I18nAuthentication {
	title: string;
	short_description: string;
	users: string;
	methods: string;
}

interface I18nDatastore {
	title: string;
	short_description: string;
	data: string;
	documents: string;
}

interface I18nStorage {
	title: string;
	short_description: string;
	assets: string;
}

interface I18nAnalytics {
	title: string;
	dashboard: string;
	loading: string;
	empty: string;
	get_started: string;
	start: string;
	description: string;
	initializing: string;
	create_orbiter_price: string;
	create: string;
	ready: string;
	satellites: string;
	all_satellites: string;
	number_of_sessions: string;
	unique_page_views: string;
	total_page_views: string;
	average_page_views_per_session: string;
	bounce_rate: string;
	overview: string;
	id: string;
	tracked_events: string;
	count: string;
	referrers: string;
	enabled: string;
}

interface I18nHosting {
	title: string;
	short_description: string;
	success: string;
	configure: string;
	add_records: string;
	dns_notes: string;
	delete_custom_domain: string;
	before_continuing: string;
	delete_are_you_sure: string;
	delete: string;
	edit: string;
	type: string;
	host: string;
	value: string;
	config_in_progress: string;
	add_custom_domain: string;
	description: string;
	custom_domain: string;
	default_domain: string;
	domain: string;
	status: string;
	pendingorder: string;
	pendingchallengeresponse: string;
	pendingacmeapproval: string;
	available: string;
	failed: string;
}

interface I18nCli {
	title: string;
	sign_in: string;
	add: string;
	select_all: string;
	unselect_all: string;
	profile: string;
	segments: string;
	profile_placeholder: string;
}

interface I18nErrors {
	no_mission_control: string;
	cli_missing_params: string;
	cli_missing_selection: string;
	cli_unexpected_error: string;
	satellite_name_missing: string;
	satellite_unexpected_error: string;
	satellite_no_found: string;
	satellite_name_update: string;
	satellite_missing_name: string;
	ledger_balance_credits: string;
	hosting_missing_domain_name: string;
	hosting_invalid_url: string;
	hosting_missing_dns_configuration: string;
	hosting_configuration_issues: string;
	hosting_loading_errors: string;
	hosting_no_custom_domain: string;
	hosting_delete_custom_domain: string;
	controllers_listing: string;
	controllers_no_selection: string;
	controllers_delete: string;
	data_delete: string;
	key_invalid: string;
	full_path_invalid: string;
	collection_invalid: string;
	controller_invalid: string;
	observatory_get_unexpected_error: string;
	observatory_set_unexpected_error: string;
	collection_added: string;
	collection_updated: string;
	collection_deleted: string;
	rule_invalid: string;
	upgrade_load_versions: string;
	upgrade_download_error: string;
	upgrade_error: string;
	upgrade_no_version: string;
	upgrade_no_wasm: string;
	upgrade_requires_iterative_version: string;
	top_up_error: string;
	analytics_load_error: string;
	satellites_loading: string;
	orbiters_loading: string;
	orbiter_configuration_missing: string;
	orbiter_configuration_unexpected: string;
	orbiter_configuration_listing: string;
}

interface I18nDocument {
	owner: string;
	created: string;
	updated: string;
	data: string;
	no_match: string;
	delete: string;
	description: string;
}

interface I18nAsset {
	owner: string;
	token: string;
	headers: string;
	created: string;
	updated: string;
	no_match: string;
	delete: string;
	description: string;
	full_path: string;
}

interface I18nAdmin {
	mission_control_new_version: string;
	satellite_new_version: string;
}

interface I18nControllers {
	title: string;
	profile: string;
	scope: string;
	delete: string;
	info: string;
	delete_question: string;
	controller_id: string;
	controller_id_placeholder: string;
	no_delete: string;
	more_delete: string;
	admin: string;
	write: string;
	add_a_controller: string;
	add_intro: string;
	generate: string;
	manually: string;
	new_controller_id: string;
	new_controller_secret: string;
	controller_added: string;
	controller_added_text: string;
	controller_generated_text: string;
	adding_controller: string;
	generating_controller: string;
}

interface I18nCollections {
	title: string;
	details: string;
	key: string;
	key_placeholder: string;
	read_permission: string;
	write_permission: string;
	max_size: string;
	max_size_placeholder: string;
	public: string;
	private: string;
	managed: string;
	controllers: string;
	empty: string;
	added: string;
	updated: string;
	deleted: string;
	delete_question: string;
	none: string;
}

interface I18nSort {
	title: string;
	keys: string;
	created_at: string;
	updated_at: string;
	sort_by_field: string;
	sort_results: string;
	ascending: string;
	descending: string;
}

interface I18nFilter {
	title: string;
	filter_keys: string;
	filter_owner: string;
	placeholder_keys: string;
	placeholder_owners: string;
}

interface I18nUsers {
	identifier: string;
	provider: string;
	created: string;
	updated: string;
	empty: string;
	enabled: string;
}

interface I18nObservatory {
	title: string;
	overview: string;
	loading: string;
	monitoring: string;
	enabled: string;
	disabled: string;
	submit_enable: string;
	submit_disable: string;
	email_notifications: string;
	email_notifications_placeholder: string;
	cycles_threshold: string;
	cycles_threshold_placeholder: string;
}

interface I18nSettings {
	title: string;
	dev_id: string;
}

interface I18nExamples {
	tutorial_1_title: string;
	tutorial_1_description: string;
	tutorial_2_title: string;
	tutorial_2_description: string;
	tutorial_3_title: string;
	tutorial_3_description: string;
	tutorial_4_title: string;
	tutorial_4_description: string;
	example_1_title: string;
	example_1_description: string;
	example_2_title: string;
	example_2_description: string;
	example_3_title: string;
	example_3_description: string;
	example_4_title: string;
	example_4_description: string;
	example_5_title: string;
	example_5_description: string;
	example_6_title: string;
	example_6_description: string;
	example_7_title: string;
	example_7_description: string;
	example_8_title: string;
	example_8_description: string;
}

interface I18nResources {
	product: string;
	developers: string;
	resources: string;
	resources_description: string;
	changelog: string;
	changelog_description: string;
}

interface I18nOn_boarding {
	what: string;
	dapp: string;
	website: string;
	install: string;
	npm: string;
	init: string;
	deploy: string;
	local: string;
	cli: string;
	login: string;
	run: string;
	success: string;
}

interface I18n {
	lang: Languages;
	core: I18nCore;
	canisters: I18nCanisters;
	sign_in: I18nSign_in;
	satellites: I18nSatellites;
	mission_control: I18nMission_control;
	authentication: I18nAuthentication;
	datastore: I18nDatastore;
	storage: I18nStorage;
	analytics: I18nAnalytics;
	hosting: I18nHosting;
	cli: I18nCli;
	errors: I18nErrors;
	document: I18nDocument;
	asset: I18nAsset;
	admin: I18nAdmin;
	controllers: I18nControllers;
	collections: I18nCollections;
	sort: I18nSort;
	filter: I18nFilter;
	users: I18nUsers;
	observatory: I18nObservatory;
	settings: I18nSettings;
	examples: I18nExamples;
	resources: I18nResources;
	on_boarding: I18nOn_boarding;
}
