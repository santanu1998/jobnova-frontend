import React from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog'
import { Button } from '../../../../components/ui/button'

const SectionDialog = ({ title, children, open, onClose, onSave, error, saving }) => {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>
                    {title}
                </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
                {children}
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <DialogFooter>
                <Button variant='outline' onClick={onClose} disabled={saving}>Cancel</Button>
                <Button onClick={onSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default SectionDialog
