"use client";

import React, { useState, useEffect } from 'react';

type Status = 'Pending' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';

interface JobApplication {
  id: number;
  company: string;
  position: string;
  status: Status;
  dateApplied: string;
  checklist: {
    resumeSent: boolean;
    coverLetterSent: boolean;
    followUpSent: boolean;
  };
}

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: Omit<JobApplication, 'id'>) => void;
}

const NewJobModal = ({ isOpen, onClose, onAdd }: NewJobModalProps) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Pending' as Status,
    dateApplied: new Date().toISOString().split('T')[0],
    checklist: { resumeSent: false, coverLetterSent: false, followUpSent: false },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      company: '',
      position: '',
      status: 'Pending',
      dateApplied: new Date().toISOString().split('T')[0],
      checklist: { resumeSent: false, coverLetterSent: false, followUpSent: false },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Job Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Company</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Google"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Position</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              >
                <option value="Pending">Pending</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Date Applied</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.dateApplied}
                onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md shadow-blue-500/20"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface JobRowProps {
  application: JobApplication;
  onUpdate: (id: number, updates: Partial<JobApplication>) => void;
  onDelete: (id: number) => void;
}

const JobRow = ({ application, onUpdate, onDelete }: JobRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application);

  const handleToggleChecklist = (field: keyof JobApplication['checklist']) => {
    onUpdate(application.id, {
      checklist: { ...application.checklist, [field]: !application.checklist[field] }
    });
  };

  const handleSaveEdit = () => {
    onUpdate(application.id, editData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50/30 dark:bg-blue-900/10 transition-colors">
        <td className="px-6 py-4">
          <input
            type="text"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.company}
            onChange={(e) => setEditData({ ...editData, company: e.target.value })}
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.position}
            onChange={(e) => setEditData({ ...editData, position: e.target.value })}
          />
        </td>
        <td className="px-6 py-4">
          <select
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value as Status })}
          >
            <option value="Pending">Pending</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </td>
        <td className="px-6 py-4">
          <input
            type="date"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.dateApplied}
            onChange={(e) => setEditData({ ...editData, dateApplied: e.target.value })}
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="text-green-600 hover:text-green-700 font-medium text-sm px-2 py-1"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-600 font-medium text-sm px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-100">{application.company}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{application.position}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm
          ${application.status === 'Applied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
            application.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            application.status === 'Offered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            application.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400'}`}>
          {application.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">{application.dateApplied}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={application.checklist.resumeSent} 
                onChange={() => handleToggleChecklist('resumeSent')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="group-hover:text-blue-600 transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">Resume</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={application.checklist.coverLetterSent} 
                onChange={() => handleToggleChecklist('coverLetterSent')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="group-hover:text-blue-600 transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">Cover Letter</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={application.checklist.followUpSent} 
                onChange={() => handleToggleChecklist('followUpSent')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="group-hover:text-blue-600 transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">Follow-up</span>
            </label>
          </div>
          <div className="flex gap-3 ml-8">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jobApplications');
    if (saved) {
      setApplications(JSON.parse(saved));
    } else {
      setApplications([
        {
          id: 1,
          company: 'Tech Corp',
          position: 'Frontend Engineer',
          status: 'Applied',
          dateApplied: '2023-10-01',
          checklist: { resumeSent: true, coverLetterSent: true, followUpSent: false },
        },
      ]);
    }
    setIsMounted(true);
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
    alert('Changes saved successfully!');
  };

  const updateApplication = (id: number, updates: Partial<JobApplication>) => {
    setApplications(apps => apps.map(app => 
      app.id === id ? { ...app, ...updates } : app
    ));
  };

  const deleteApplication = (id: number) => {
    if (confirm('Are you sure you want to delete this application?')) {
      setApplications(apps => apps.filter(app => app.id !== id));
    }
  };

  const addNewJob = (newJobData: Omit<JobApplication, 'id'>) => {
    const newJob: JobApplication = {
      ...newJobData,
      id: Date.now(),
    };
    setApplications([newJob, ...applications]);
  };

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Add Application
        </button>
      </div>

      <div className="relative group">
        {/* Table Elevation Container */}
        <div className="overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50/50 dark:bg-zinc-800/50 backdrop-blur-sm border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Date Applied</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Actions & Checklist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <JobRow 
                      key={app.id} 
                      application={app} 
                      onUpdate={updateApplication} 
                      onDelete={deleteApplication}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p className="font-medium italic">No applications found. Add your first one!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={saveToLocalStorage}
          className="group relative px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg shadow-xl shadow-zinc-500/20 hover:shadow-zinc-500/40 transition-all active:scale-95 flex items-center gap-3"
        >
          <span>Save All Changes</span>
          <svg className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </button>
      </div>

      <NewJobModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addNewJob} 
      />
    </div>
  );
};

export default JobChecklist;
