import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Mail,
  Phone,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Code,
  Cloud,
  Database,
  Cpu,
  CheckCircle,
} from 'lucide-react';

const DeveloperProfile: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Picture Placeholder */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-300">
            <span className="text-4xl sm:text-5xl font-bold text-gray-600">PR</span>
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">PRASHANT RAJ</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-3">
              Software Engineer | Java Backend | Spring Boot | React | Python | Data Engineering
            </p>
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              Available for Immediate Joining
            </div>
            <p className="text-gray-700 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
              Passionate Software Engineer with 2.6 years of professional experience in backend development,
              enterprise applications, automation, cloud technologies, and scalable software systems.
              Experienced in Java Spring Boot, Python, React, REST APIs, AWS, Docker, CI/CD, and modern
              software engineering practices.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <Button
                variant="primary"
                onClick={() => window.open('https://prashantvit1.github.io/', '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                View Portfolio
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open('https://github.com/prashantvit1', '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                GitHub
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open('https://www.linkedin.com/in/prashant-raj-8219b11aa/', '_blank')}
                icon={<ExternalLink className="w-4 h-4" />}
              >
                LinkedIn
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open('mailto:praaj99341@gmail.com', '_blank')}
                icon={<Mail className="w-4 h-4" />}
              >
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <Card title="Professional Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <Briefcase className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">Experience</h4>
              <p className="text-gray-600">2.6 Years</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Code className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">Backend Development</h4>
              <p className="text-gray-600">Java, Spring Boot, Python</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Cloud className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">Cloud & DevOps</h4>
              <p className="text-gray-600">AWS, Docker, Kubernetes, CI/CD</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Database className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">Data Engineering</h4>
              <p className="text-gray-600">ETL Pipelines, Analytics</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Cpu className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">System Design</h4>
              <p className="text-gray-600">Microservices, Distributed Systems</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900">Problem Solving</h4>
              <p className="text-gray-600">Debugging, Automation, Optimization</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Technical Skills */}
      <Card title="Technical Skills">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Backend */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Backend
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Java (Core, OOP)', 'Spring Boot', 'Spring MVC', 'Spring Security', 'Spring Data JPA',
                'Hibernate', 'REST APIs', 'Microservices', 'JWT', 'RBAC', 'J2EE', 'JBPM',
                'Python', 'FastAPI', 'SQLAlchemy'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Frameworks */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Spring Boot', 'Spring MVC', 'Spring Security', 'Spring Cloud', 'Hibernate',
                'FastAPI'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Testing */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Testing
            </h4>
            <div className="flex flex-wrap gap-2">
              {['JUnit 5', 'Jest', 'Testcontainers', 'BDD', 'TDD'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Tools
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Git', 'Maven', 'Postman', 'Swagger/OpenAPI', 'Jira', 'Kafka', 'MongoDB',
                'PostgreSQL', 'MySQL'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Cloud & DevOps */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-600" />
              Cloud & DevOps
            </h4>
            <div className="flex flex-wrap gap-2">
              {['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'OpenShift', 'Linux', 'CI/CD'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Concepts */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Concepts
            </h4>
            <div className="flex flex-wrap gap-2">
              {['System Design', 'Distributed Systems', 'REST API Design', 'Agile', 'Scrum',
                'HLD', 'LLD'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Experience */}
      <Card title="Experience">
        <div className="space-y-6">
          {/* Alignerr */}
          <div className="border-l-4 border-blue-600 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">Software Engineer (Freelancing)</h4>
              <span className="text-sm text-gray-500">Nov 2025 – Present</span>
            </div>
            <p className="text-blue-600 font-medium mb-2">Alignerr</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• LLM code review and engineering quality validation</li>
              <li>• Code validation and automated quality checks</li>
            </ul>
          </div>

          {/* Visteon */}
          <div className="border-l-4 border-blue-600 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">Software Engineer</h4>
              <span className="text-sm text-gray-500">Jul 2023 – Aug 2025</span>
            </div>
            <p className="text-blue-600 font-medium mb-2">Visteon Corporation</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• Enterprise backend development with Java Spring Boot</li>
              <li>• React frontend integration and API development</li>
              <li>• CI/CD pipeline implementation and automation</li>
              <li>• Code quality improvements and testing</li>
              <li>• Debugging and troubleshooting complex issues</li>
            </ul>
          </div>

          {/* Intelimek */}
          <div className="border-l-4 border-blue-600 pl-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">Software Developer Intern</h4>
              <span className="text-sm text-gray-500">Jan 2023 – Jun 2023</span>
            </div>
            <p className="text-blue-600 font-medium mb-2">Intelimek Systems Pvt Ltd</p>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• REST API development and integration</li>
              <li>• SQL database design and optimization</li>
              <li>• Backend development and automation</li>
              <li>• Machine Learning and Computer Vision projects</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Featured Projects */}
      <Card title="Featured Projects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Backend Order Management Service',
              stack: 'Java, Spring Boot, PostgreSQL',
              overview: 'Scalable order management system with microservices architecture',
              contributions: 'API design, database optimization, caching strategies',
              impact: 'Reduced order processing time by 40%',
            },
            {
              name: 'Order Service Exception Handling',
              stack: 'Spring Boot, Custom Framework',
              overview: 'Centralized exception handling framework for enterprise applications',
              contributions: 'Framework design, error categorization, logging integration',
              impact: 'Improved debugging efficiency by 60%',
            },
            // {
            //   name: 'Leave Approval Workflow',
            //   stack: 'JBPM, Spring Boot, React',
            //   overview: 'Automated leave management system with workflow engine',
            //   contributions: 'Workflow design, UI integration, approval logic',
            //   impact: 'Reduced approval cycle time by 50%',
            // },

            {
              name: 'ArthaFlow – Enterprise ETL & Analytics Platform',
              stack: 'React, FastAPI, PostgreSQL, Recharts, Docker',
              overview: 'Enterprise-inspired ETL and business intelligence platform for processing relational datasets and delivering interactive analytics.',
              contributions: 'Architected the full-stack application, developed ETL workflows, designed RESTful analytics APIs, implemented responsive dashboards, containerized the application with Docker, and managed cloud deployment.',
              impact: 'Reduced manual data analysis by automating CSV ingestion, transformation, and visualization through interactive KPI dashboards and downloadable analytics reports.',
            },
            
            {
              name: 'AWS Serverless ETL Pipeline',
              stack: 'AWS Lambda, Glue, S3',
              overview: 'Serverless data pipeline for automated data processing',
              contributions: 'Pipeline design, Lambda functions, monitoring',
              impact: 'Reduced infrastructure costs by 70%',
            },
            {
              name: 'Microservice Deployment Automation',
              stack: 'Docker, Kubernetes, GitHub Actions',
              overview: 'CI/CD pipeline for automated microservice deployment',
              contributions: 'Pipeline configuration, containerization, orchestration',
              impact: 'Reduced deployment time from hours to minutes',
            },
          ].map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
              <p className="text-sm text-blue-600 mb-2">{project.stack}</p>
              <p className="text-sm text-gray-600 mb-2">{project.overview}</p>
              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">Contributions:</span> {project.contributions}
              </div>
              <div className="text-xs text-green-600 font-medium">
                Impact: {project.impact}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Certifications & Publication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Certifications */}
        <Card title="Certifications">
          <div className="space-y-3">
            {[
              'Oracle Cloud Infrastructure & AWS Multicloud Certified Architect',
              'Oracle OCI 2025 Generative AI Professional',
              'Coding Ninjas Python Programming',
            ].map((cert, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{cert}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Publication */}
        <Card title="Publication">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              A Smart System for Detection of Road Lane and Divider
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Journal:</span> Scopus Indexed IJRITCC
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Accuracy:</span> 95.50%
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">DOI:</span>{' '}
              <a
                href="https://doi.org/10.17762/ijritcc.v11i8.7944"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                10.17762/ijritcc.v11i8.7944
              </a>
            </p>
          </div>
        </Card>
      </div>

      {/* Education */}
      <Card title="Education">
        <div className="border-l-4 border-blue-600 pl-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">Bachelor of Technology</h4>
            <span className="text-sm text-gray-500">Graduated</span>
          </div>
          <p className="text-blue-600 font-medium mb-1">Electronics & Telecommunication Engineering</p>
          <p className="text-gray-600 mb-2">Vishwakarma Institute of Technology, Pune</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-1" />
              CGPA: 8.51
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Key Courses:</p>
            <div className="flex flex-wrap gap-2">
              {['DSA', 'DBMS', 'Java', 'Machine Learning', 'Operating Systems', 'Networking'].map((course) => (
                <span key={course} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Contact */}
      <Card title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="mailto:praaj99341@gmail.com"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-900 font-medium">praaj99341@gmail.com</p>
            </div>
          </a>
          <a
            href="https://prashantvit1.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Portfolio</p>
              <p className="text-sm text-gray-900 font-medium">prashantvit1.github.io</p>
            </div>
          </a>
          <a
            href="https://github.com/prashantvit1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">GitHub</p>
              <p className="text-sm text-gray-900 font-medium">prashantvit1</p>
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/prashant-raj-8219b11aa/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">LinkedIn</p>
              <p className="text-sm text-gray-900 font-medium">in/prashant-raj-8219b11aa/</p>
            </div>
          </a>
          <a
            href="tel:+917479947107"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-900 font-medium">+91 7479947107</p>
            </div>
          </a>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Interested in collaborating on backend engineering, cloud applications, or scalable software systems?
        </h3>
        <p className="text-gray-600 mb-6 text-lg">Let's connect.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => window.open('mailto:praaj99341@gmail.com', '_blank')}
            icon={<Mail className="w-4 h-4" />}
          >
            Get in Touch
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open('https://www.linkedin.com/in/prashant-raj-8219b11aa/', '_blank')}
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Connect on LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;
