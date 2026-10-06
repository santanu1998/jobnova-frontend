import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { FileText, Copy, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import api from "../../../../reduxt-store/api";

// Lists the candidate's other resumes; picking one loads its full data and
// hands it to `onSelect(resume)` so the section can copy what it needs.
function CopyFromMenu({ resumes = [], onSelect }) {
  const [loading, setLoading] = useState(false);

  const handlePick = async (item) => {
    if (!onSelect) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/resumes/${item.id}`);
      await onSelect(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="gap-1.5 text-xs text-slate-600 border-dashed hover:text-primary hover:border-primary"
          variant="outline"
          size="sm"
          disabled={loading || resumes.length === 0}
          title={resumes.length === 0 ? "You have no other resumes to copy from" : undefined}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
          Copy From Resume
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"w-60"}>
        <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Select a resume to copy</DropdownMenuLabel>

        <DropdownMenuSeparator />
        {resumes.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="cursor-pointer gap-2"
            onClick={() => handlePick(item)}
          >
            <FileText />
            <span>{item.title}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CopyFromMenu;
