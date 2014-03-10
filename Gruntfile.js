module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    bowerInstall: {
      target: {
      	src: [ 'examples/*.html' ]
      }
    },
    watch: {
      livereload: {
        files: [
          "examples/**",
          "jquery.switcheroo.js",
	  "index.html"
        ],
        options: {
          livereload: true
        }
      }
    }

  });

  grunt.registerTask('default', 'watch');
  grunt.registerTask('bower', 'bowerInstall');
}
