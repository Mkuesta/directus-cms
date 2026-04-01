# Common Patterns

## Hero Section {#hero}

```tsx
<section className="py-20 md:py-32">
  <div className="container">
    <div className="max-w-3xl mx-auto text-center">
      <Badge className="mb-4">New Release</Badge>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Your Headline Here
      </h1>
      <p className="text-xl text-muted-foreground mt-6">
        Your subheadline goes here with more details about your product.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </div>
  </div>
</section>
```

### Hero with Image

```tsx
<section className="py-20 md:py-32">
  <div className="container">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <Badge className="mb-4">New Release</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Your Headline Here
        </h1>
        <p className="text-xl text-muted-foreground mt-6">
          Your subheadline goes here.
        </p>
        <div className="flex gap-4 mt-8">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">Learn More</Button>
        </div>
      </div>
      <div className="relative">
        <img
          src="/hero-image.png"
          alt="Product screenshot"
          className="rounded-lg shadow-2xl"
        />
      </div>
    </div>
  </div>
</section>
```

## Features Grid {#features}

```tsx
<section className="py-16 md:py-24">
  <div className="container">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Features</h2>
      <p className="text-muted-foreground mt-2">Everything you need to succeed</p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <Card key={feature.title}>
          <CardHeader>
            <feature.icon className="h-10 w-10 text-primary mb-2" />
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  </div>
</section>
```

### Features with Icons

```tsx
const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed and performance.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Enterprise-grade security built in.",
  },
  {
    icon: Sparkles,
    title: "AI Powered",
    description: "Intelligent features that learn from you.",
  },
];
```

## Pricing Section {#pricing}

```tsx
<section className="py-16 md:py-24 bg-muted/50">
  <div className="container">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Simple Pricing</h2>
      <p className="text-muted-foreground mt-2">Choose the plan that's right for you</p>
    </div>
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={plan.featured ? "border-primary shadow-lg" : ""}
        >
          <CardHeader>
            {plan.featured && (
              <Badge className="w-fit mb-2">Most Popular</Badge>
            )}
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">{plan.price}</div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.featured ? "default" : "outline"}
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
</section>
```

## Testimonials {#testimonials}

```tsx
<section className="py-16 md:py-24">
  <div className="container">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">What People Say</h2>
      <p className="text-muted-foreground mt-2">Trusted by thousands of users</p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((t) => (
        <Card key={t.author}>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={t.avatar} />
                <AvatarFallback>{t.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
```

## FAQ Accordion {#faq}

```tsx
<section className="py-16 md:py-24 bg-muted/50">
  <div className="container max-w-3xl">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
      <p className="text-muted-foreground mt-2">Everything you need to know</p>
    </div>
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
</section>
```

## CTA Section {#cta}

```tsx
<section className="py-16 md:py-24 bg-primary text-primary-foreground">
  <div className="container text-center">
    <h2 className="text-3xl font-bold">Ready to get started?</h2>
    <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
      Join thousands of satisfied customers and transform your workflow today.
    </p>
    <div className="mt-8">
      <Button size="lg" variant="secondary">
        Get Started Free
      </Button>
    </div>
  </div>
</section>
```

### CTA with Form

```tsx
<section className="py-16 md:py-24 bg-muted/50">
  <div className="container max-w-xl text-center">
    <h2 className="text-3xl font-bold">Stay Updated</h2>
    <p className="text-muted-foreground mt-2">
      Get notified about new features and updates.
    </p>
    <form className="flex gap-2 mt-8">
      <Input placeholder="Enter your email" type="email" className="flex-1" />
      <Button type="submit">Subscribe</Button>
    </form>
  </div>
</section>
```

## Footer {#footer}

```tsx
<footer className="border-t py-12">
  <div className="container">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h4 className="font-semibold mb-4">Product</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Features</a></li>
          <li><a href="#" className="hover:text-foreground">Pricing</a></li>
          <li><a href="#" className="hover:text-foreground">Changelog</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">About</a></li>
          <li><a href="#" className="hover:text-foreground">Blog</a></li>
          <li><a href="#" className="hover:text-foreground">Careers</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Resources</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Documentation</a></li>
          <li><a href="#" className="hover:text-foreground">Help Center</a></li>
          <li><a href="#" className="hover:text-foreground">Guides</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Legal</h4>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Privacy</a></li>
          <li><a href="#" className="hover:text-foreground">Terms</a></li>
          <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
        </ul>
      </div>
    </div>
    <Separator className="my-8" />
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-muted-foreground text-sm">
        © 2024 Your Company. All rights reserved.
      </p>
      <div className="flex gap-4">
        <a href="#" className="text-muted-foreground hover:text-foreground">
          <Twitter className="h-5 w-5" />
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground">
          <Github className="h-5 w-5" />
        </a>
        <a href="#" className="text-muted-foreground hover:text-foreground">
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  </div>
</footer>
```

## Stats Section {#stats}

```tsx
<section className="py-16 border-y">
  <div className="container">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <p className="text-4xl font-bold text-primary">10K+</p>
        <p className="text-muted-foreground mt-1">Active Users</p>
      </div>
      <div>
        <p className="text-4xl font-bold text-primary">99.9%</p>
        <p className="text-muted-foreground mt-1">Uptime</p>
      </div>
      <div>
        <p className="text-4xl font-bold text-primary">24/7</p>
        <p className="text-muted-foreground mt-1">Support</p>
      </div>
      <div>
        <p className="text-4xl font-bold text-primary">50+</p>
        <p className="text-muted-foreground mt-1">Countries</p>
      </div>
    </div>
  </div>
</section>
```
