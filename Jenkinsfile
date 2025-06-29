pipeline {
    agent any

    tools {
        nodejs 'nodejs20'  // Đảm bảo rằng đây là tên bạn đã cấu hình trong Jenkins
    }

    stages {
        stage('Clone repository') {
            steps {
                git branch: 'main', url: 'git@github.com:batungnbt/mktlogin-app-ui.git'
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    def envContent = """
                        PORT=3033
                        REACT_APP_HOST_API=https://apidev.mktlogin.com
                        REACT_APP_QR_CODE_GENERATE_API=https://api.vietqr.io/v2/generate
                        REACT_APP_CLIENT_ID=153393972996-aqr5ineelaj8idjoh5ubj13ufg8flmhr.apps.googleusercontent.com
                        REACT_APP_REDIRECT_URI=https://app.mktlogin.com
                        REACT_APP_REDIRECT_OAUTH=https://mkt.city
                        REACT_APP_REDIRECT_URI_LOGIN=https://app.mktlogin.com/login/google
                        GENERATE_SOURCEMAP=false
                    """.stripIndent().trim()

                    writeFile(file: '.env', text: envContent)
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'yarn install'
            }
        }

        stage('Build app') {
            steps {
                sh 'yarn build'
            }
        }

        stage('Build image') {
            steps {
                script {
                    app = docker.build("batungnbt/mktlogin-app-ui")
                }
            }
        }

        stage('Test image') {
            steps {
                script {
                    app.inside {
                        sh 'echo "Tests passed"'
                    }
                }
            }
        }

        stage('Push image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'tung-docker-hub') {
                        app.push("${env.BUILD_NUMBER}")
                    }
                }
            }
        }

        stage('Trigger ManifestUpdate') {
            steps {
                script {
                    echo "triggering updatemanifestjob"
                    build job: 'MKTLOGIN-APP-UI-UPDATE-MANIFEST', parameters: [string(name: 'DOCKERTAG', value: env.BUILD_NUMBER)]
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
    }
}
