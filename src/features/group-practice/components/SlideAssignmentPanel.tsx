import { useState } from "react";
import { Users, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { updateMemberAssignment } from "../lib/roomService";

interface Member {
  id: string;
  user_id: string;
  username?: string;
  isLeader?: boolean;
}

interface SlideAssignmentPanelProps {
  members: Member[];
  totalSlides: number;
  onAssignmentsChange?: (assignments: any[]) => void;
}

export default function SlideAssignmentPanel({ 
  members, 
  totalSlides,
  onAssignmentsChange 
}: SlideAssignmentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [assignments, setAssignments] = useState<Record<string, { start: number; end: number }>>({});

  const handleAssignment = async (memberId: string, start: number, end: number) => {
    const newAssignments = {
      ...assignments,
      [memberId]: { start, end }
    };
    setAssignments(newAssignments);
    
    // Notify parent
    const assignmentArray = Object.entries(newAssignments).map(([id, range], index) => ({ 
      memberId: id,
      slideStart: range.start,
      slideEnd: range.end,
      turnOrder: index + 1,
    }));
    onAssignmentsChange?.(assignmentArray);

    // Save to database
    try {
      await updateMemberAssignment(
        memberId,
        start,
        end,
        Object.keys(newAssignments).indexOf(memberId) + 1 // turn order
      );
    } catch (err) {
    }
  };

  const getAssignedSlides = () => {
    const assigned = new Set<number>();
    Object.values(assignments).forEach(({ start, end }) => {
      for (let i = start; i <= end; i++) {
        assigned.add(i);
      }
    });
    return assigned;
  };

  const assignedSlides = getAssignedSlides();
  const coverage = totalSlides > 0 ? (assignedSlides.size / totalSlides) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-warm-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-cream-warm/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-teal" />
          <h3 className="font-bold text-brown">Assign Slides to Members</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-brown-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-brown-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {/* Coverage Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-brown-muted mb-2">
              <span>Coverage</span>
              <span>{Math.round(coverage)}%</span>
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal transition-all duration-300"
                style={{ width: `${coverage}%` }}
              />
            </div>
          </div>

          {/* Assignment Inputs */}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-cream-warm/50 border border-warm-border"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal/10 text-teal font-bold text-sm shrink-0">
                {(member.username || 'U').charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-brown text-sm truncate">{member.username || 'User'}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={totalSlides}
                  placeholder="1"
                  value={assignments[member.id]?.start || ''}
                  onChange={(e) => {
                    const start = parseInt(e.target.value) || 1;
                    const end = assignments[member.id]?.end || start;
                    handleAssignment(member.id, start, end);
                  }}
                  className="w-16 px-2 py-1 text-center text-sm font-bold rounded-lg border border-warm-border focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                />
                <span className="text-brown-muted font-bold">-</span>
                <input
                  type="number"
                  min={assignments[member.id]?.start || 1}
                  max={totalSlides}
                  placeholder={totalSlides.toString()}
                  value={assignments[member.id]?.end || ''}
                  onChange={(e) => {
                    const end = parseInt(e.target.value) || totalSlides;
                    const start = assignments[member.id]?.start || 1;
                    handleAssignment(member.id, start, end);
                  }}
                  className="w-16 px-2 py-1 text-center text-sm font-bold rounded-lg border border-warm-border focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
                />
              </div>
            </div>
          ))}

          {coverage < 100 && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-600 font-bold">
                Belum semua slide terassign. Coverage: {Math.round(coverage)}%
              </p>
            </div>
          )}
          {coverage === 100 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-600 font-bold">
                Semua slide sudah terassign. Siap untuk mulai.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
