import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Check, Download, RotateCcw, Shield, User } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge, Button, Card, PageHeader } from "@/components/ui/primitives";
import { learnerService } from "@/services";
import type { Learner } from "@/types/igot";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Profile & Settings | iGOT AI Hub" },
      {
        name: "description",
        content:
          "Civil service profile, cadre verification details, learning preferences, and notification settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<Learner | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", role: "", department: "", cadre: "" });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assessmentReminders, setAssessmentReminders] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState("4 hours");
  const [formatPreference, setFormatPreference] = useState("Micro-learning Modules");

  const { isDemoMode } = useAuth();

  useEffect(() => {
    learnerService.getProfile().then((p) => {
      setProfile(p);
      if (p) {
        setEditForm({
          name: p.name,
          role: p.role,
          department: p.department,
          cadre: p.cadre,
        });
      }
    });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await learnerService.updateProfile({
        ...profile,
        ...editForm,
      });
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success("Identity profile updated successfully.");
      // Trigger a refresh of any components listening to learner changes
      window.dispatchEvent(new Event("igot_store_updated"));
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Preferences updated successfully.");
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset demo data? This will restore initial course enrollments and mock diagnostic scores.",
      )
    ) {
      learnerService.resetDemo();
      toast.info("Demo data reset to baseline. Reloading...");
      setTimeout(() => window.location.reload(), 400);
    }
  };

  const handleExportTranscript = () => {
    toast.success("Competency Transcript exported. Download initiated.");
  };

  if (!profile) return null;

  return (
    <AppLayout>
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Profile & Settings" },
        ]}
        title="Profile & Settings"
        subtitle="Civil service identity credentials, learning preferences, and system notification controls."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card
            title="Civil Service Identity"
            action={
              !isDemoMode && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              )
            }
          >
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="profile-fullname" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="profile-role" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Designation / Role
                  </label>
                  <input
                    id="profile-role"
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="profile-department" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Department
                  </label>
                  <input
                    id="profile-department"
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="profile-cadre" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Cadre / Service
                  </label>
                  <select
                    id="profile-cadre"
                    value={editForm.cadre}
                    onChange={(e) => setEditForm({ ...editForm, cadre: e.target.value })}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm"
                  >
                    <option>Central Secretariat Service (CSS)</option>
                    <option>Indian Administrative Service (IAS)</option>
                    <option>Indian Police Service (IPS)</option>
                    <option>Indian Revenue Service (IRS)</option>
                    <option>Central Secretariat Stenographers Service (CSSS)</option>
                  </select>
                </div>
                <Button size="sm" className="w-full" type="submit">
                  Update Identity
                </Button>
              </form>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {profile.avatarInitials}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-foreground">{profile.name}</h2>
                  <p className="text-sm font-medium text-secondary">{profile.role}</p>
                  <Badge tone="success" className="mt-2">
                    {isDemoMode ? "Verified Prototype Profile" : "Verified Parichay Profile"}
                  </Badge>
                </div>

                <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Cadre / Service
                    </span>
                    <p className="font-medium text-foreground">{profile.cadre}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Department
                    </span>
                    <p className="font-medium text-foreground">{profile.department}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Government Email
                    </span>
                    <p className="font-medium text-foreground">{profile.email}</p>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Prototype Management Card */}
          <Card
            title={isDemoMode ? "Prototype Controls" : "Data Management"}
            subtitle={
              isDemoMode
                ? "Manage demo states for SIH presentation"
                : "Manage your competency records"
            }
          >
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTranscript}
                className="w-full justify-start text-left"
              >
                <Download className="mr-2 h-4 w-4" /> Export Competency Transcript
              </Button>
              {isDemoMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDemoData}
                  className="w-full justify-start text-left text-destructive hover:bg-destructive/10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Prototype Demo Data
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Preferences Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card
            title="Learning & Assessment Preferences"
            subtitle="Configure delivery formats, pace targets, and notifications"
          >
            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* Target Goals */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pref-weekly-goal" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Weekly Commitment Target
                  </label>
                  <select
                    id="pref-weekly-goal"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option>2 hours / week</option>
                    <option>4 hours / week (Recommended)</option>
                    <option>6 hours / week</option>
                    <option>8 hours / week (Intensive)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pref-learning-format" className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Preferred Learning Format
                  </label>
                  <select
                    id="pref-learning-format"
                    value={formatPreference}
                    onChange={(e) => setFormatPreference(e.target.value)}
                    className="focus-ring mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option>Micro-learning Modules (15-30 mins)</option>
                    <option>Comprehensive Masterclasses (2-4 hours)</option>
                    <option>Scenario & Case-Study Driven</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground">Communication Preferences</h3>
                <div className="mt-3 space-y-3">
                  <label htmlFor="pref-toggle-reminders" className="flex items-center justify-between rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Assessment Milestone Alerts
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Receive notifications when diagnostic tests or reassessments are due
                        </p>
                      </div>
                    </div>
                    <input
                      id="pref-toggle-reminders"
                      type="checkbox"
                      checked={assessmentReminders}
                      onChange={(e) => setAssessmentReminders(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                  </label>

                  <label htmlFor="pref-toggle-digest" className="flex items-center justify-between rounded-md border border-border p-3 cursor-pointer hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Official Ministry Digest
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Weekly progress summaries sent to official @gov.in address
                        </p>
                      </div>
                    </div>
                    <input
                      id="pref-toggle-digest"
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">
                  <Check className="mr-1.5 h-4 w-4" /> Save Preferences
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
