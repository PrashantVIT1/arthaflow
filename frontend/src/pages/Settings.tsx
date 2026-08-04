import React from 'react';
import Card from '../components/ui/Card';
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Info, Zap, Lock, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your application preferences</p>
      </div>

      <Card title="Theme Settings" subtitle="Customize the appearance of the application">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sun className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Light Mode</h4>
                <p className="text-sm text-gray-500">Use light color scheme</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Dark Mode</h4>
                <p className="text-sm text-gray-500">Use dark color scheme</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto Theme</h4>
                <p className="text-sm text-gray-500">Follow system preferences</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </Card>

      <Card title="Notification Settings" subtitle="Configure how you receive notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive email updates</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </Card>

      <Card title="Privacy & Security" subtitle="Manage your privacy and security settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Application Information" subtitle="Details about the current application">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Application Name</span>
            <span className="text-sm font-medium text-gray-900">ArthaFlow</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Phase</span>
            <span className="text-sm font-medium text-gray-900">Phase 1 (MVP)</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <span className="text-sm text-gray-600">Build Date</span>
            <span className="text-sm font-medium text-gray-900">January 2024</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-600">Environment</span>
            <span className="text-sm font-medium text-gray-900">Development</span>
          </div>
        </div>
      </Card>

      <Card title="Coming in Phase 2" subtitle="Features planned for future releases" className="border-blue-200">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Authentication & Authorization</h4>
              <p className="text-sm text-gray-500">JWT, OAuth 2.0, and Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Advanced Data Sources</h4>
              <p className="text-sm text-gray-500">Snowflake integration, Redis caching, and Kafka streaming</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">DevOps & Infrastructure</h4>
              <p className="text-sm text-gray-500">Docker containerization, Kubernetes orchestration, and CI/CD pipelines</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Advanced Analytics</h4>
              <p className="text-sm text-gray-500">Machine learning models, predictive analytics, and automated insights</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Real-time Notifications</h4>
              <p className="text-sm text-gray-500">WebSocket-based real-time alerts and dashboard updates</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Support" subtitle="Get help and support">
        <div className="space-y-3">
          <a href="#" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Documentation</span>
            </div>
            <span className="text-gray-400">→</span>
          </a>
          <a href="#" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">API Reference</span>
            </div>
            <span className="text-gray-400">→</span>
          </a>
          <a href="#" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Contact Support</span>
            </div>
            <span className="text-gray-400">→</span>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
