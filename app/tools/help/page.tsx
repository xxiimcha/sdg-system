import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, Smartphone, ArrowLeftRight, CheckCircle, AlertTriangle } from "lucide-react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function ToolScanHelpPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/tools">Documentation</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>QR Code Help</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto py-10">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scanning">Scanning QR Codes</TabsTrigger>
              <TabsTrigger value="actions">Tool Actions</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code System Overview</CardTitle>
                  <CardDescription>How our QR code system works for tool management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our tool management system uses QR codes to provide quick access to tool information and actions. Each
                    tool in the inventory has a unique QR code that links directly to its detail page.
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                      <QrCode className="h-10 w-10 text-primary mb-2" />
                      <h3 className="font-medium">Scan QR Code</h3>
                      <p className="text-sm text-muted-foreground">Use your phone's camera or a QR code scanner app</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                      <Smartphone className="h-10 w-10 text-primary mb-2" />
                      <h3 className="font-medium">View Tool Details</h3>
                      <p className="text-sm text-muted-foreground">See tool information and available actions</p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                      <ArrowLeftRight className="h-10 w-10 text-primary mb-2" />
                      <h3 className="font-medium">Perform Actions</h3>
                      <p className="text-sm text-muted-foreground">Check out, return, or schedule maintenance</p>
                    </div>
                  </div>

                  <p className="mt-4">
                    This system allows field workers to quickly manage tools without needing to access a computer. All they
                    need is their smartphone to scan the QR code attached to each tool.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanning">
              <Card>
                <CardHeader>
                  <CardTitle>How to Scan QR Codes</CardTitle>
                  <CardDescription>Step-by-step guide to scanning tool QR codes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-medium text-lg">Using Your Phone's Camera</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Open your phone's camera app</li>
                    <li>Point the camera at the QR code on the tool</li>
                    <li>Hold steady until the camera recognizes the code</li>
                    <li>Tap on the notification or link that appears</li>
                    <li>Your browser will open the tool's detail page</li>
                  </ol>

                  <h3 className="font-medium text-lg mt-6">Using a QR Code Scanner App</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Download a QR code scanner app from your app store</li>
                    <li>Open the QR code scanner app</li>
                    <li>Point the camera at the QR code on the tool</li>
                    <li>The app will automatically scan the code</li>
                    <li>Tap on the link to open the tool's detail page</li>
                  </ol>

                  <div className="bg-muted p-4 rounded-lg mt-6">
                    <h4 className="font-medium">Recommended QR Scanner Apps</h4>
                    <ul className="list-disc pl-5 mt-2">
                      <li>iPhone: Built-in Camera app</li>
                      <li>Android: Google Lens or built-in Camera app (on newer phones)</li>
                      <li>Any device: QR Code Reader by Scan, QR Scanner by Kaspersky</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Actions</CardTitle>
                  <CardDescription>Actions you can perform after scanning a tool's QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <ArrowLeftRight className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="font-medium">Check Out Tool</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      Assign a tool to a project. This action is only available when the tool status is "Available". You'll
                      need to select a project and optionally set an expected return date.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-medium">Check In Tool</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      Return a tool that was previously checked out. This action is only available when the tool status is
                      "Not Available" and it's currently assigned to a project.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="font-medium">Schedule Maintenance</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      Schedule routine, repair, or inspection maintenance for a tool. You'll need to select a maintenance
                      type, date, and optionally add notes about the maintenance needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium">Complete Maintenance</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      Mark a scheduled maintenance as completed. This action is only available when the tool status is
                      "Under Maintenance" and it has an active maintenance schedule.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions about the QR code tool management system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-medium">What if the QR code is damaged or unreadable?</h3>
                    <p className="text-sm text-muted-foreground">
                      If a QR code is damaged, you can manually enter the tool's serial number in the search box on the
                      <Link href="/tools" className="text-primary hover:underline">
                        {" "}
                        Tools Inventory
                      </Link>{" "}
                      page. You can also generate a new QR code from the tool's detail page.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium">Can I scan QR codes without internet access?</h3>
                    <p className="text-sm text-muted-foreground">
                      You need internet access to view the tool details and perform actions. However, you can scan the QR
                      code without internet, and the link will open once you're back online.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium">How do I print QR codes for my tools?</h3>
                    <p className="text-sm text-muted-foreground">
                      You can download QR codes for each tool from the Tools Inventory page by clicking the QR code icon.
                      Print them on weatherproof labels and attach them to your tools.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium">What if someone without access scans a tool's QR code?</h3>
                    <p className="text-sm text-muted-foreground">
                      The tool detail page requires authentication. If someone without proper access scans a QR code, they
                      will be prompted to log in and will only see information they're authorized to view.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-medium">Can I use this system on a desktop computer?</h3>
                    <p className="text-sm text-muted-foreground">
                      Yes, all the functionality is also available through the web interface. You can manage tools directly
                      from the Tools Inventory page without scanning QR codes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        
      </div>
    </SidebarInset>
  )
}

