import React, { useState } from 'react';
import { BarChart2, PieChart, TrendingUp, Download, AlertTriangle, Plus, FileText, Upload, CheckCircle, RotateCcw, FileSpreadsheet, X, Users, Trash2 } from 'lucide-react';
import { Task, Project, User, ReportRequest, ReportSubmission, ReportStatus, UserGroup, TableCell } from '../types';
import ExcelGrid from './ExcelGrid';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
  users: User[];
  reportRequests: ReportRequest[];
  reportSubmissions: ReportSubmission[];
  userGroups: UserGroup[];
  onCreateRequest: (req: ReportRequest) => void;
  onSubmitReport: (sub: ReportSubmission) => void;
  onUpdateSubmissionStatus: (submissionId: string, status: ReportStatus, feedback?: string) => void;
  onCreateGroup: (name: string, userIds: string[]) => void;
  onDeleteGroup: (groupId: string) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ 
  tasks, projects, currentUser, users, 
  reportRequests, reportSubmissions, userGroups,
  onCreateRequest, onSubmitReport, onUpdateSubmissionStatus,
  onCreateGroup, onDeleteGroup
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'workflow'>('workflow');
  
  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  
  // Create Request State
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqDue, setReqDue] = useState('');
  const [reqAssigned, setReqAssigned] = useState<string[]>([]);

  // Create Group State
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>([]);

  // Submission State
  const [selectedRequest, setSelectedRequest] = useState<ReportRequest | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  
  // Initialize Excel with TableCell structure
  const initialExcelData: TableCell[][] = [
    [{value: ''}, {value: ''}, {value: ''}], 
    [{value: ''}, {value: ''}, {value: ''}], 
    [{value: ''}, {value: ''}, {value: ''}]
  ];
  
  const [excelData, setExcelData] = useState<TableCell[][]>(initialExcelData);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Admin Review State
  const [selectedSubmission, setSelectedSubmission] = useState<ReportSubmission | null>(null);
  const [adminFeedback, setAdminFeedback] = useState('');

  const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);

  const handleCreateRequest = () => {
    const newReq: ReportRequest = {
      id: `req-${Date.now()}`,
      title: reqTitle,
      description: reqDesc,
      dueDate: reqDue,
      assignedUserIds: reqAssigned,
      createdBy: currentUser.id,
      requiredFormat: 'any'
    };
    onCreateRequest(newReq);
    setIsRequestModalOpen(false);
    // Reset form
    setReqTitle(''); setReqAssigned([]);
  };

  const handleCreateGroup = () => {
    if (groupName && groupMembers.length > 0) {
      onCreateGroup(groupName, groupMembers);
      setIsGroupModalOpen(false);
      setGroupName('');
      setGroupMembers([]);
    }
  };

  const handleGroupSelection = (groupId: string) => {
    if (groupId === '') return;
    const group = userGroups.find(g => g.id === groupId);
    if (group) {
      // Merge unique IDs
      const newSet = new Set([...reqAssigned, ...group.userIds]);
      setReqAssigned(Array.from(newSet));
    }
  };

  const handleSubmit = () => {
    if (!selectedRequest) return;
    const submission: ReportSubmission = {
      id: `sub-${Date.now()}`,
      requestId: selectedRequest.id,
      userId: currentUser.id,
      submittedAt: new Date().toISOString(),
      status: ReportStatus.SUBMITTED,
      content: submissionContent,
      tableData: excelData,
      files: uploadedFiles
    };
    onSubmitReport(submission);
    setSelectedRequest(null);
  };

  const handleFileUpload = () => {
    const fakeFile = `Document_${Math.floor(Math.random() * 1000)}.pdf`;
    setUploadedFiles([...uploadedFiles, fakeFile]);
  };

  // --- Render Sub-Components ---

  const renderAnalytics = () => {
    // ... existing analytics code ...
     const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;

    return (
      <div className="p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <PieChart size={16} /> Статус задач
            </h3>
            <div className="flex items-center justify-center h-48">
              <div className="flex gap-2 items-end h-32 w-full justify-around px-8">
                 <Bar height={`h-[${Math.max(10, (todoTasks/totalTasks || 0)*100)}%]`} color="bg-gray-300" label="To Do" value={todoTasks} />
                 <Bar height={`h-[${Math.max(10, (inProgressTasks/totalTasks || 0)*100)}%]`} color="bg-blue-400" label="In Progress" value={inProgressTasks} />
                 <Bar height={`h-[${Math.max(10, (reviewTasks/totalTasks || 0)*100)}%]`} color="bg-yellow-400" label="Review" value={reviewTasks} />
                 <Bar height={`h-[${Math.max(10, (doneTasks/totalTasks || 0)*100)}%]`} color="bg-green-400" label="Done" value={doneTasks} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflow = () => {
    if (isAdminOrManager) {
      // ADMIN VIEW
      return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Управление отчетами</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Users size={16} /> Группы
              </button>
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus size={16} /> Создать запрос
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {reportRequests.map(req => (
              <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.title}</h3>
                    <p className="text-sm text-gray-500">{req.description}</p>
                    <p className="text-xs text-red-500 mt-1">Срок: {req.dueDate}</p>
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                    {req.assignedUserIds.length} сотрудников
                  </span>
                </div>
                
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Сдачи</h4>
                  <div className="space-y-2">
                    {req.assignedUserIds.map(uid => {
                      const user = users.find(u => u.id === uid);
                      const sub = reportSubmissions.find(s => s.requestId === req.id && s.userId === uid);
                      
                      return (
                        <div key={uid} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${user?.avatarColor || 'bg-gray-300'} text-white flex items-center justify-center text-xs`}>
                              {user?.name.charAt(0)}
                            </div>
                            <span>{user?.name}</span>
                          </div>
                          
                          {sub ? (
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                sub.status === ReportStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                sub.status === ReportStatus.RETURNED ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {sub.status === ReportStatus.SUBMITTED ? 'Сдано' : 
                                 sub.status === ReportStatus.APPROVED ? 'Принято' : 'На доработке'}
                              </span>
                              <button 
                                onClick={() => setSelectedSubmission(sub)}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Проверить
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Не сдано</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // EMPLOYEE VIEW
      const myRequests = reportRequests.filter(r => r.assignedUserIds.includes(currentUser.id));

      if (selectedRequest) {
        // Submission Form
        // CRITICAL: Ensure this container scrolls
        return (
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-6 pb-20"> 
              <button onClick={() => setSelectedRequest(null)} className="mb-4 text-sm text-gray-500 hover:text-gray-900 sticky top-0 bg-gray-50/50 backdrop-blur-sm p-2 rounded z-10 w-full text-left">
                ← Назад к списку
              </button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-1">{selectedRequest.title}</h2>
                <p className="text-gray-500 text-sm mb-6">{selectedRequest.description}</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Комментарий / Текст отчета</label>
                    <textarea 
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Опишите проделанную работу..."
                    />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                       <FileSpreadsheet size={16} /> 2. Табличные данные (Excel)
                     </label>
                     <p className="text-xs text-gray-500 mb-2">Вы можете скопировать данные из Excel и вставить сюда (Ctrl+V)</p>
                     <ExcelGrid data={excelData} onChange={setExcelData} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Upload size={16} /> 3. Файлы
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={handleFileUpload}>
                      <p className="text-sm text-gray-500">Нажмите, чтобы загрузить файл</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="text-sm text-blue-600 flex items-center gap-2">
                          <FileText size={14} /> {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                      onClick={handleSubmit}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md"
                    >
                      Сдать отчет
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Employee List
      return (
        <div className="p-6 space-y-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800">Мои отчеты</h2>
          {myRequests.map(req => {
            const sub = reportSubmissions.find(s => s.requestId === req.id && s.userId === currentUser.id);
            return (
              <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold text-gray-900">{req.title}</h3>
                  <p className="text-sm text-gray-500">{req.description}</p>
                  {sub?.feedback && (
                     <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                       <b>Комментарий менеджера:</b> {sub.feedback}
                     </div>
                  )}
                </div>
                <div>
                  {sub ? (
                    <div className={`flex flex-col items-end gap-1`}>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        sub.status === ReportStatus.APPROVED ? 'bg-green-100 text-green-700' :
                        sub.status === ReportStatus.RETURNED ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {sub.status === ReportStatus.APPROVED ? 'Принято' : 
                         sub.status === ReportStatus.RETURNED ? 'На доработке' : 'На проверке'}
                      </span>
                      {sub.status === ReportStatus.RETURNED && (
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Редактировать
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectedRequest(req)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      Сдать
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/50 relative overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-gray-900">Отчеты и аналитика</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'workflow' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Рабочий процесс
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Аналитика
          </button>
        </div>
      </div>

      {activeTab === 'analytics' ? renderAnalytics() : renderWorkflow()}

      {/* Admin Create Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">Создать запрос отчета</h3>
            <input 
              className="w-full border p-2 rounded mb-3" 
              placeholder="Название (напр. Еженедельный отчет)" 
              value={reqTitle} 
              onChange={e => setReqTitle(e.target.value)} 
            />
            <textarea 
              className="w-full border p-2 rounded mb-3" 
              placeholder="Описание требования" 
              value={reqDesc} 
              onChange={e => setReqDesc(e.target.value)} 
            />
            <input 
              type="date"
              className="w-full border p-2 rounded mb-3" 
              value={reqDue} 
              onChange={e => setReqDue(e.target.value)} 
            />
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-bold block">Назначить сотрудникам:</label>
                 {userGroups.length > 0 && (
                   <select 
                     onChange={(e) => handleGroupSelection(e.target.value)}
                     className="text-xs border p-1 rounded"
                   >
                     <option value="">Выбрать группу...</option>
                     {userGroups.map(g => (
                       <option key={g.id} value={g.id}>{g.name}</option>
                     ))}
                   </select>
                 )}
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1 border p-2 rounded bg-gray-50">
                {users.filter(u => u.role !== 'admin').map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-sm hover:bg-gray-100 p-1 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={reqAssigned.includes(u.id)}
                      onChange={e => {
                        if (e.target.checked) setReqAssigned([...reqAssigned, u.id]);
                        else setReqAssigned(reqAssigned.filter(id => id !== u.id));
                      }}
                    />
                    {u.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-gray-600">Отмена</button>
              <button onClick={handleCreateRequest} className="px-4 py-2 bg-blue-600 text-white rounded">Создать</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Управление группами</h3>
                <button onClick={() => setIsGroupModalOpen(false)}><X size={20} className="text-gray-400" /></button>
             </div>
             
             <div className="mb-6">
               <h4 className="text-sm font-semibold mb-2">Создать новую группу</h4>
               <input 
                 className="w-full border p-2 rounded mb-3" 
                 placeholder="Название группы (напр. Разработчики)" 
                 value={groupName} 
                 onChange={e => setGroupName(e.target.value)} 
               />
               <div className="max-h-32 overflow-y-auto space-y-1 border p-2 rounded bg-gray-50 mb-3">
                {users.filter(u => u.role !== 'admin').map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-sm">
                    <input 
                      type="checkbox" 
                      checked={groupMembers.includes(u.id)}
                      onChange={e => {
                        if (e.target.checked) setGroupMembers([...groupMembers, u.id]);
                        else setGroupMembers(groupMembers.filter(id => id !== u.id));
                      }}
                    />
                    {u.name}
                  </label>
                ))}
              </div>
              <button 
                onClick={handleCreateGroup}
                disabled={!groupName || groupMembers.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
              >
                Сохранить группу
              </button>
             </div>

             <div className="border-t pt-4">
               <h4 className="text-sm font-semibold mb-2">Существующие группы</h4>
               {userGroups.length === 0 && <p className="text-sm text-gray-400">Нет групп</p>}
               <div className="space-y-2">
                 {userGroups.map(g => (
                   <div key={g.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                     <span className="font-medium text-sm">{g.name} <span className="text-gray-400 font-normal">({g.userIds.length})</span></span>
                     <button onClick={() => onDeleteGroup(g.id)} className="text-red-500 hover:text-red-700">
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 h-[85vh] flex flex-col">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Проверка отчета</h3>
              <button onClick={() => setSelectedSubmission(null)}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-bold text-sm mb-2">Текст отчета:</h4>
                 <p className="whitespace-pre-wrap">{selectedSubmission.content}</p>
               </div>
               {selectedSubmission.tableData && (
                 <div>
                   <h4 className="font-bold text-sm mb-2">Данные Excel:</h4>
                   <ExcelGrid data={selectedSubmission.tableData} onChange={()=>{}} readOnly />
                 </div>
               )}
               {selectedSubmission.files && (
                 <div>
                   <h4 className="font-bold text-sm mb-2">Файлы:</h4>
                   {selectedSubmission.files.map(f => <div key={f} className="text-sm text-blue-600 flex items-center gap-2"><FileText size={14} /> {f}</div>)}
                 </div>
               )}
            </div>
            <div className="pt-4 border-t mt-4 shrink-0">
              <textarea 
                className="w-full border p-2 rounded mb-3 text-sm focus:outline-none focus:border-blue-500" 
                placeholder="Комментарий для сотрудника..." 
                value={adminFeedback} 
                onChange={e => setAdminFeedback(e.target.value)} 
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    onUpdateSubmissionStatus(selectedSubmission.id, ReportStatus.RETURNED, adminFeedback);
                    setSelectedSubmission(null);
                    setAdminFeedback('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  <RotateCcw size={16} /> На доработку
                </button>
                <button 
                  onClick={() => {
                     onUpdateSubmissionStatus(selectedSubmission.id, ReportStatus.APPROVED, adminFeedback);
                     setSelectedSubmission(null);
                     setAdminFeedback('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <CheckCircle size={16} /> Принять отчет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Bar = ({ height, color, label, value }: any) => (
  <div className="flex flex-col items-center gap-2 group w-full">
    <div className={`w-full ${height === 'h-[NaN%]' ? 'h-1' : height} ${color} rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity relative min-h-[4px]`}>
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
        {value}
      </div>
    </div>
    <span className="text-xs text-gray-500 font-medium">{label}</span>
  </div>
);

export default ReportsView;