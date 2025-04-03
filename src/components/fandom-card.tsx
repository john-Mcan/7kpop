import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface FandomCardProps {
  fandom: {
    id: string;
    name: string;
    slug: string;
    category: string;
    members: any[];
    posts: any[];
  };
}

export default function FandomCard({ fandom }: FandomCardProps) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/fandoms/${fandom.slug}`} className="text-md font-medium hover:text-purple-600 transition-colors">
              {fandom.name}
            </Link>
            <div className="text-xs text-gray-500 mt-1 capitalize">
              Categoría: {fandom.category}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-medium">{fandom.members.length.toLocaleString()}</span> miembros • 
              <span className="font-medium"> {fandom.posts.length.toLocaleString()}</span> posts
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-sm text-purple-600 border-purple-200 hover:bg-purple-50">
            Seguir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 