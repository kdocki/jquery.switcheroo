module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    bowerInstall: {
      target: {
      	src: [ 'example.html' ]
      }
    },
    watch: {
      livereload: {
        files: [
          'example.html',
          "jquery.toggleswitch.js"
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
