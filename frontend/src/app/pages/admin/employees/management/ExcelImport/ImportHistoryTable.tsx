import React from "react";
import { ImportHistory } from "./types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Button } from "../../../../../components/ui/button";
import { Download, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../../../../components/ui/utils";

interface ImportHistoryTableProps {
  history: ImportHistory[];
}

export function ImportHistoryTable({ history }: ImportHistoryTableProps) {
  return (
    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Name</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploaded Date</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploaded By</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Importer Type</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Log</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length > 0 ? (
            history.map((item) => (
              <TableRow key={item.id} className="border-border/50 group hover:bg-secondary/30 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{item.fileName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[11px] font-semibold text-muted-foreground">
                  {new Date(item.uploadedDate).toLocaleDateString()} {new Date(item.uploadedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell className="text-[11px] font-semibold text-muted-foreground">{item.uploadedBy}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest rounded-md bg-secondary text-foreground border-border">
                    {item.importerType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.status === "COMPLETED" ? (
                      <Badge className="text-[9px] font-black uppercase tracking-widest rounded-md bg-emerald-500 text-white border-none">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {item.status}
                      </Badge>
                    ) : item.status === "FAILED" ? (
                      <Badge className="text-[9px] font-black uppercase tracking-widest rounded-md bg-rose-500 text-white border-none">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {item.status}
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] font-black uppercase tracking-widest rounded-md bg-amber-500 text-white border-none">
                        {item.status}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8 rounded-lg",
                      item.status === "FAILED" ? "text-rose-500 hover:bg-rose-50" : "text-primary hover:bg-primary/5"
                    )}
                    onClick={() => console.log("Downloading log for", item.id)}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground italic uppercase tracking-widest opacity-60">
                No import history available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
