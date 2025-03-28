import { supabase } from "@/lib/supabase"

export const revalidate = 3600 // Revalidate every hour

export default async function AboutPage() {
  // Fetch about us content
  const { data: aboutUs, error } = await supabase.from("about_us").select("*").single()

  if (error) {
    console.error("Error fetching about us:", error)
  }

  // Parse team members if needed
  let teamMembers = aboutUs?.team_members || []
  if (typeof teamMembers === "string") {
    try {
      teamMembers = JSON.parse(teamMembers)
    } catch (e) {
      console.error("Error parsing team members:", e)
      teamMembers = []
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">{aboutUs?.title || "About Us"}</h1>

      <div className="prose prose-lg max-w-none mb-16">
        <p className="text-lg leading-relaxed">
          {aboutUs?.content ||
            "We are an e-commerce platform dedicated to providing high-quality products at competitive prices."}
        </p>
      </div>

      {(aboutUs?.mission || aboutUs?.vision) && (
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {aboutUs?.mission && (
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg">{aboutUs.mission}</p>
            </div>
          )}
          {aboutUs?.vision && (
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg">{aboutUs.vision}</p>
            </div>
          )}
        </div>
      )}

      {teamMembers.length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member: any, index: number) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm">
                <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=96&width=96&text=${member.name.charAt(0)}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-center">{member.name}</h3>
                <p className="text-center text-muted-foreground mb-4">{member.position}</p>
                <p className="text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

