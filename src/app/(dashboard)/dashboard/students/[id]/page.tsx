import DashboardLayout from "../../../DashboardLayout"
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/20/solid'
import { getSessionContext } from "app/KeystoneContext";
import { Suspense } from "react";
import StudentForm from "components/StudentForm"

import { redirect } from 'next/navigation';
import { isCuid } from 'cuid'

import { gql } from "@ts-gql/tag/no-transform";

const GET_STUDENT = gql`
    query GET_STUDENT($id: ID!) {
        student(where: { id: $id }) {
            id
            firstName
            surname
            dateOfBirth
        }
    }
`as import("../../../../../../__generated__/ts-gql/GET_STUDENT").type

export default async function Students({ params }: { params: { id?: string } }) {
    if (!params.id || !isCuid(params.id)) {
        redirect('/dashboard/students')
    }
    const context = await getSessionContext();
    const { student } = await context.graphql.run({ query: GET_STUDENT, variables: { id: params.id } })
    if (!student) {
        redirect('/dashboard/students')
    }

    return (
        <DashboardLayout PageName="Students">
            <div className="py-4">
                <Suspense fallback={<p>Loading feed...</p>}>
                    <StudentForm student={{ ...student }} />
                </Suspense>
            </div>
        </DashboardLayout>
    )
}
