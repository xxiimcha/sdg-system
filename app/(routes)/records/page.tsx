"use client";

import React from 'react';
// import { Link } from 'react-router-dom';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const breadcrumbs = [
    { title: "Material Record", url: "/records/materials" },
    { title: "Material History", url: "/records/material-history" },
    { title: "Labor Record", url: "/records/labor-record" },
    { title: "Labor History", url: "/records/labor-history" },
    { title: "Category", url: "/records/material-category" },
];

const RecordsPage = () => {
    return (
        <SidebarInset>
            {/* Page Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Resources</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            {/* Page Content */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4 pt-0">
                {breadcrumbs.map((breadcrumb, index) => (
                    <Card key={index} className="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800">
                            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{breadcrumb.title}</h2>
                            <p className="mb-3 text-gray-500 dark:text-gray-400">
                                {index === 0 && "Manage and track all materials efficiently."}
                                {index === 1 && "View the history of material usage and changes."}
                                {index === 2 && "Record labor details accurately and efficiently."}
                                {index === 3 && "View the history of labor usage and changes."}
                                {index === 4 && "Categorize materials for better organization."}
                            </p>
                            <a href={breadcrumb.url} className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-700">
                                Learn more
                                <svg className="w-2.5 h-2.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                            </a>
                        </div>
                    </Card>
                ))}
            </div>
        </SidebarInset>
    );
};

export default RecordsPage;
