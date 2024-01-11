module.exports = {
	apps : [{
		name: 'api',
		script: './api.js',
		exec_mode: 'cluster_mode',
		instances: 'max',
		max_memory_restart: '256M'
	}]
};