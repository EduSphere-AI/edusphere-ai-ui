export default async function DocumentPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    console.log('Slug:', slug);

    return (
        <div>
            <h1>Document Page for Slug: {slug}</h1>
        </div>
    );
}
