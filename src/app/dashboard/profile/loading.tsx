import DashboardLayout from "../DashboardLayout";

export default function Loading() {
    return (
        <DashboardLayout PageName="Profile">
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl font-medium">Loading...</p>
            </div>
        </DashboardLayout>
    )
}