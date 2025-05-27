import React from 'react';
import FloatingMenu from './FloatingMenu';

const VersionHistoryMenu = ({ versions, menuPosition, menuRef }) => (
  <FloatingMenu title="Version History" menuPosition={menuPosition} menuRef={menuRef}>
    <div className="flex flex-col gap-1 w-44 max-h-60 overflow-y-auto p-1">
      {versions.length > 0 ? (
        versions.slice(0, 10).map((version) => (
          <div
            key={version.id}
            className={`flex justify-between items-center px-1.5 py-1 rounded-md border transition-all cursor-pointer ${
              version.active ? 'bg-pink-100 border-pink-300 shadow-sm' : 'border-pink-100 hover:bg-pink-50 hover:border-pink-200'
            }`}
          >
            <div>
              <div className="text-xs font-medium text-gray-700 truncate w-32" title={version.name}>
                {version.name}
              </div>
              <div className="text-[10px] text-pink-500">{version.timestamp}</div>
            </div>
            {version.active && (
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full flex-shrink-0 ml-1"></div>
            )}
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-500 p-2 text-center">No history yet.</p>
      )}
    </div>
  </FloatingMenu>
);

export default VersionHistoryMenu;