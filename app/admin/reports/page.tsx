"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportConfig {
  type: string;
  format: string;
  dateRange: string;
}

interface GeneratedReport {
  name: string;
  date: string;
  format: string;
  size: string;
  url: string;
}

export default function AdminReportsPage() {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: "overview",
    format: "csv",
    dateRange: "month",
  });
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const stored = localStorage.getItem("recentReports");
      if (stored) {
        setRecentReports(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to fetch recent reports:", error);
    }
  };

  const saveReportToStorage = (report: GeneratedReport) => {
    const updated = [report, ...recentReports.slice(0, 9)];
    setRecentReports(updated);

    const toStore = updated.map((r) => ({
      ...r,
      url: r.url.startsWith("blob:") ? "" : r.url,
    }));
    localStorage.setItem("recentReports", JSON.stringify(toStore));
  };

  const downloadReport = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleGenerateReport = async (reportType: string) => {
    try {
      setGenerating(true);

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: reportType,
          format: reportConfig.format,
          dateRange: reportConfig.dateRange,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Use correct extension based on format
      let extension = reportConfig.format;
      let displayFormat = reportConfig.format.toUpperCase();

      // Temporarily treat PDF/Excel as JSON until proper generation is implemented
      if (reportConfig.format === "pdf" || reportConfig.format === "excel") {
        extension = "json";
        displayFormat = "JSON";
      }

      const filename = `${reportType.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${extension}`;

      downloadReport(blob, filename);

      const newReport: GeneratedReport = {
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        date: new Date().toISOString().split("T")[0],
        format: displayFormat,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        url: blobUrl,
      };

      saveReportToStorage(newReport);

      toast({
        title: "Report Generated",
        description: `${reportType} report has been downloaded as ${displayFormat}`,
      });
    } catch (error) {
      console.error("Generate report error:", error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadExisting = async (report: GeneratedReport) => {
    try {
      if (report.url && report.url.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = report.url;
        a.download = `${report.name.replace(/\s+/g, "-")}.${report.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toast({
          title: "Download Started",
          description: `${report.name} is being downloaded`,
        });
        return;
      }

      toast({
        title: "Report Expired",
        description:
          "This report has expired. Please regenerate it using the Generate button.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download report. Please regenerate it.",
        variant: "destructive",
      });
    }
  };

  const reports = [
    {
      title: "Patient Analytics",
      description:
        "Comprehensive patient demographics, visit patterns, and health metrics",
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      metrics: ["Demographics", "Visits", "Conditions"],
    },
    {
      title: "Appointment Report",
      description:
        "Appointment trends, no-show rates, and scheduling efficiency",
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      metrics: ["Scheduled", "Completed", "Cancelled"],
    },
    {
      title: "Revenue Analysis",
      description:
        "Financial performance, collection rates, and revenue trends",
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      metrics: ["Total Revenue", "Collections", "Outstanding"],
    },
    {
      title: "Doctor Performance",
      description:
        "Doctor productivity, patient satisfaction, and consultation metrics",
      icon: <Activity className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      metrics: ["Consultations", "Reviews", "Availability"],
    },
    {
      title: "Prescription Report",
      description:
        "Medication trends, prescription volumes, and pharmacy analytics",
      icon: <ClipboardList className="h-6 w-6" />,
      color: "from-pink-500 to-pink-600",
      metrics: ["Total Rx", "By Category", "Refills"],
    },
    {
      title: "Operational Metrics",
      description:
        "System usage, response times, and operational efficiency KPIs",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-indigo-500 to-indigo-600",
      metrics: ["Efficiency", "Utilization", "Wait Times"],
    },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin", "staff"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                Reports & Analytics
              </h1>
              <p className="text-slate-600 mt-1">
                Generate comprehensive system reports and analytics
              </p>
            </div>

            {/* Report Configuration */}
            <Card className="border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure report parameters before generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select
                      value={reportConfig.type}
                      onValueChange={(value) =>
                        setReportConfig({ ...reportConfig, type: value })
                      }
                    >
                      <SelectTrigger id="report-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overview">
                          System Overview
                        </SelectItem>
                        <SelectItem value="patients">Patients</SelectItem>
                        <SelectItem value="appointments">
                          Appointments
                        </SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="doctors">Doctors</SelectItem>
                        <SelectItem value="prescriptions">
                          Prescriptions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-range">Date Range</Label>
                    <Select
                      value={reportConfig.dateRange}
                      onValueChange={(value) =>
                        setReportConfig({ ...reportConfig, dateRange: value })
                      }
                    >
                      <SelectTrigger id="date-range">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Select
                      value={reportConfig.format}
                      onValueChange={(value) =>
                        setReportConfig({ ...reportConfig, format: value })
                      }
                    >
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">JSON (Excel WIP)</SelectItem>
                        <SelectItem value="pdf">JSON (PDF WIP)</SelectItem>
                      </SelectContent>
                    </Select>
                    {(reportConfig.format === "pdf" ||
                      reportConfig.format === "excel") && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Currently downloads as JSON. Full format support
                        coming soon.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => handleGenerateReport(reportConfig.type)}
                    disabled={generating}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Reports */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-slate-200"
                  >
                    <CardContent className="p-0">
                      <div
                        className={`bg-gradient-to-br ${report.color} p-6 text-white rounded-t-lg`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            {report.icon}
                          </div>
                          <FileText className="h-6 w-6 opacity-70" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                          {report.title}
                        </h3>
                        <p className="text-sm opacity-90">
                          {report.description}
                        </p>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-slate-600 mb-2">
                            KEY METRICS
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {report.metrics.map((metric, i) => (
                              <span
                                key={i}
                                className="text-xs bg-slate-100 px-2 py-1 rounded"
                              >
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleGenerateReport(report.title)}
                          disabled={generating}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
              <Card className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Recently generated reports (session storage)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentReports.map((report, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold">{report.name}</div>
                            <div className="text-sm text-slate-500">
                              {new Date(report.date).toLocaleDateString()} •{" "}
                              {report.format} • {report.size}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadExisting(report)}
                          disabled={
                            !report.url || !report.url.startsWith("blob:")
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
