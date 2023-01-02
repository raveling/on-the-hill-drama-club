import { gql, OperationData } from '@ts-gql/tag/no-transform';
import { getSessionContext } from 'app/KeystoneContext';
import EnrolButton from 'components/EnrolButton';
import Link from 'next/link';
import labelHelper from "lib/labelHelper";
import { useRouter } from 'next/navigation';
import { type GET_LESSON_BY_ID } from '../queries'
import { enrolmentStatusOptions } from 'types/selectOptions';


const GET_STUDENTS_ENROLMENTS = gql`
    query GET_STUDENTS_ENROLMENTS($minYear: Int!, $maxYear: Int!) {
        students(where: {AND: [{yearLevel: {gte: $minYear}}, {yearLevel: {lte: $maxYear}}]}) {
            id
            firstName
            yearLevel
            surname
            enrolments {
                id
                status
                lesson {
                    id
                    name
                }
            }
        }
    }
    `as import("../../../../../../__generated__/ts-gql/GET_STUDENTS_ENROLMENTS").type

export default async function StudentList({ lesson }: { lesson: NonNullable<OperationData<typeof GET_LESSON_BY_ID>['lesson']> }) {
    const router = useRouter();
    const context = await getSessionContext();
    if (lesson.maxYear === null || !lesson.minYear === null) {
        router.push('/dashboard/lessons')
    }
    const { students } = await context.graphql.run({ query: GET_STUDENTS_ENROLMENTS, variables: { minYear: lesson.minYear!, maxYear: lesson.maxYear! } })
    return (
        <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        First Name
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Surname
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        School Year Level
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Enrol</span>
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Enrol</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {students ? students.map((student) => (
                                    <tr key={student.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {student.firstName}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.surname}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.yearLevel}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            {student.enrolments?.some((enrolment) => enrolment.lesson?.id === lesson.id
                                            ) ? (
                                                <p> Enrolment Status - {
                                                    labelHelper(enrolmentStatusOptions, student.enrolments?.find((enrolment) => enrolment.lesson?.id === lesson.id)?.status || 'ERROR')}
                                                </p>
                                            ) : (
                                                <EnrolButton studentId={student.id} lessonId={lesson.id} />
                                            )}
                                        </td>
                                    </tr>
                                )) : <tr>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        No students found
                                    </td>
                                </tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}