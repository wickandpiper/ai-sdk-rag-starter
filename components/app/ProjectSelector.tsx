import { Input } from '@/components/ui/input';
import { ChevronsUpDown, ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

type ProjectSelectorProps = {
  currentProject: string;
  setCurrentProject: (project: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProjects: string[];
};

export function ProjectSelector({
  currentProject,
  setCurrentProject,
  searchQuery,
  setSearchQuery,
  filteredProjects
}: ProjectSelectorProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center space-x-2 text-base font-medium text-purple-700 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm hover:bg-white/90 transition-colors">
          <ChevronsUpDown className="h-3.5 w-3.5" />
          <span>{currentProject}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content 
          className="z-50 w-[220px] rounded-md border bg-white shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2" 
          sideOffset={4}
        >
          <div className="p-1.5 border-b">
            <Input 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 text-xs focus-visible:ring-purple-400"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1.5">
            {filteredProjects.map((project) => (
              <button
                key={project}
                onClick={() => {
                  setCurrentProject(project);
                  setSearchQuery("");
                }}
                className={`w-full text-left px-2 py-1 text-xs rounded-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                  currentProject === project ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                {project}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
} 