#version 330 core
out vec4 fragColor;

uniform float screenWidth;
uniform float screenHeight;

const int NUM_ITERATIONS = 2;
const float MAX_DIST = 100000.0f;
const float AMBIENT_FACTOR = 0.1f;

vec3 getRayDirection()
{
	float relX = 2.0f * (gl_FragCoord.x / screenWidth - 0.5f);
	float relY = 2.0f * (gl_FragCoord.y / screenWidth - 0.5f);
	float fovFactor = 0.8f;
	return normalize(vec3(fovFactor * relX, fovFactor * relY, 1.0f));
}

struct Intersection
{
	bool isIntersect;
	float dist;
	vec3 intersection;
	vec3 normal;
};

struct Sphere
{
	vec3 center;
	float radius;
	bool isLightSource;
	vec3 color;
};

Intersection intersectSphere(vec3 rayOrigin, vec3 rayDirection, Sphere sphere)
{
	Intersection result = Intersection(false, 0.0f, vec3(0.0f), vec3(0.0f));

	vec3 sphereCenterToOrigin = rayOrigin - sphere.center;
	float product = dot(rayDirection, sphereCenterToOrigin);
	float discriminant = dot(product, product) - (dot(sphereCenterToOrigin, sphereCenterToOrigin) - sphere.radius * sphere.radius);
	if (discriminant < 0.0f)
	{
		return result;
	}

	float dist = -product - sqrt(discriminant);
	result.isIntersect = true;
	result.dist = dist;
	result.intersection = rayOrigin + dist * rayDirection;
	result.normal = normalize(result.intersection - sphere.center);
	return result;
}

vec3 traceRay(vec3 rayOrigin, vec3 rayDirection)
{
	return vec3(0.0f);
}

void main()
{
	const int NUM_SPHERES = 3;
	Sphere spheres[NUM_SPHERES];
	spheres[0] = Sphere(vec3(2.0f, -2.0f, 10.0f), 1.5f, false, vec3(1.0f, 0.0f, 0.0f));
	spheres[1] = Sphere(vec3(-2.0f, -2.0f, 10.0f), 1.0f, false, vec3(0.0f, 1.0f, 0.0f));
	spheres[2] = Sphere(vec3(2.0f, 3.0f, 7.0f), 2.0f, true, vec3(1.0f, 1.0f, 1.0f));

	vec3 rayDirection = getRayDirection();
	vec3 rayOrigin = vec3(0.0f, 0.0f, 0.0f);
	fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
	vec3 rayColor = vec3(0.0f, 0.0f, 0.0f);

	for (int i = 0; i < NUM_ITERATIONS; i++)
	{
		Intersection closestIntersection = Intersection(false, MAX_DIST, vec3(0.0f), vec3(0.0f));
		Sphere closestSphere;
		for (int sphereIndex = 0; sphereIndex < NUM_SPHERES; sphereIndex++)
		{
			Intersection intersection = intersectSphere(rayOrigin, rayDirection, spheres[sphereIndex]);
			if (!intersection.isIntersect)
			{
				continue;
			}

			if (closestIntersection.dist > intersection.dist)
			{
				closestIntersection = intersection;
				closestSphere = spheres[sphereIndex];
			}
		}

		
		if (!closestIntersection.isIntersect)
		{
			break;
		}

		rayColor += AMBIENT_FACTOR * closestSphere.color;

		if (closestSphere.isLightSource)
		{
			rayColor += closestSphere.color;
			break;
		}
		else
		{
			rayOrigin = closestIntersection.intersection;
			rayDirection = reflect(rayDirection, closestIntersection.normal);
			float reflectionFactor = max(0.0f, dot(-rayDirection, closestIntersection.normal));
			rayColor += reflectionFactor * closestSphere.color;
		}
	}

	fragColor = vec4(rayColor, 1.0f);
}
