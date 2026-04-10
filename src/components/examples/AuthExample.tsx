import { useAuth, userHasPermission } from '@/domains/auth'
import { GuardedRoute } from '@/app/routes/guards'

export function ExampleAuthUsage() {
  const { user, status, setRole } = useAuth()

  if (status === 'loading') {
    return <div>Loading user...</div>
  }

  if (status === 'unauthenticated' || !user) {
    return <div>Please sign in</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Current User</h2>
        <p>Name: {user.displayName}</p>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Permissions</h3>
        <ul className="list-disc list-inside">
          {user.permissions.slice(0, 5).map((perm) => (
            <li key={perm}>{perm}</li>
          ))}
          {user.permissions.length > 5 && <li>...and {user.permissions.length - 5} more</li>}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Permission Checks</h3>
        <p>Can view leads: {userHasPermission(user, 'view_leads') ? '✅' : '❌'}</p>
        <p>Can approve trades: {userHasPermission(user, 'approve_trade_values') ? '✅' : '❌'}</p>
        <p>Can manage integrations: {userHasPermission(user, 'manage_integrations') ? '✅' : '❌'}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Role Switcher (Demo)</h3>
        <select
          value={user.role}
          onChange={(e) => setRole(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="owner">Owner</option>
          <option value="gm">General Manager</option>
          <option value="gsm">General Sales Manager</option>
          <option value="sales_manager">Sales Manager</option>
          <option value="sales_rep">Sales Representative</option>
          <option value="fi_manager">F&I Manager</option>
          <option value="bdc_manager">BDC Manager</option>
        </select>
      </div>

      <div>
        <h3 className="text-xl font-semibold">Protected Content</h3>
        <GuardedRoute
          user={user}
          requiredPermission="view_executive_dashboard"
          fallback={<p className="text-red-500">❌ You need executive permissions to view this</p>}
        >
          <p className="text-green-500">✅ Executive dashboard content visible</p>
        </GuardedRoute>
      </div>
    </div>
  )
}
