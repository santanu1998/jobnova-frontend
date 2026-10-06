import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Save, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Button } from '../../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { updateUser } from '../../../reduxt-store/user/userThunk'
import { API_BASE_URL } from '../../../reduxt-store/api'
import { formatEnum } from '../../../lib/constants'

const AdminProfile = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ fullName: '', phoneNumber: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setForm({ fullName: user?.fullName ?? '', phoneNumber: user?.phoneNumber ?? '' })
  }, [user])

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name is required.' })
      return
    }
    const result = await dispatch(
      updateUser({ fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim() }),
    )
    setMessage(
      result.error
        ? { type: 'error', text: result.payload || 'Failed to update profile' }
        : { type: 'success', text: 'Profile updated.' },
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Your administrator account</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="bg-primary text-white">{user?.fullName?.charAt(0) ?? 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                {formatEnum(user?.role?.replace('ROLE_', ''))} · {formatEnum(user?.status)}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Phone</Label>
              <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Email</Label>
              <p className="text-sm text-slate-700 py-2">{user?.email}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Last Login</Label>
              <p className="text-sm text-slate-700 py-2">{user?.lastLogin?.replace('T', ' ').slice(0, 16) ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${message?.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message?.text}</p>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-1">
          <p>
            API Gateway: <code className="text-xs bg-slate-100 rounded px-1.5 py-0.5">{API_BASE_URL}</code>
          </p>
          <p>Application: JobNova</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminProfile
