
pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        timeout(time: 10, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm.cmd ci'
            }
        }

        stage('Run Automated Tests') {
            steps {
                bat 'npm.cmd test -- --json --outputFile=test-report-raw.json'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'test-report-raw.json',
                             allowEmptyArchive: true
        }
    }
}
